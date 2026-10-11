const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

async function getDashboard(req, res) {
  try {
    const [[stats]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM students) AS total_students,
         (SELECT COUNT(*) FROM recruiters) AS total_recruiters,
         (SELECT COUNT(*) FROM companies) AS total_companies,
         (SELECT COUNT(*) FROM jobs) AS total_jobs,
         (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS open_jobs,
         (SELECT COUNT(*) FROM applications) AS total_applications,
         (SELECT COUNT(*) FROM students WHERE is_placed = 1) AS placed_students,
         (SELECT COUNT(*) FROM placement_drives WHERE status = 'upcoming') AS upcoming_drives,
         (SELECT COUNT(*) FROM interviews WHERE status = 'scheduled') AS scheduled_interviews`
    );

    const [recentApplications] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, u.full_name AS student_name, j.title AS job_title, c.name AS company_name
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       ORDER BY a.applied_at DESC LIMIT 8`
    );

    return res.json({ stats, recent_applications: recentApplications });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load admin dashboard', error: error.message });
  }
}

async function listStudents(req, res) {
  try {
    const { search = '', branch = '', year = '', placed = '' } = req.query;
    let sql = `
      SELECT s.*, u.full_name, u.email, u.phone, u.is_active, u.created_at AS registered_at
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR s.college LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (branch) {
      sql += ' AND s.branch = ?';
      params.push(branch);
    }
    if (year) {
      sql += ' AND s.graduation_year = ?';
      params.push(Number(year));
    }
    if (placed === 'true') {
      sql += ' AND s.is_placed = 1';
    } else if (placed === 'false') {
      sql += ' AND s.is_placed = 0';
    }

    sql += ' ORDER BY u.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ students: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list students', error: error.message });
  }
}

async function getStudentDetails(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone, u.is_active
       FROM students s JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Student not found' });

    const [skills] = await pool.query('SELECT * FROM student_skills WHERE student_id = ?', [req.params.id]);
    const [projects] = await pool.query('SELECT * FROM student_projects WHERE student_id = ?', [req.params.id]);
    const [certifications] = await pool.query('SELECT * FROM student_certifications WHERE student_id = ?', [req.params.id]);
    const [applications] = await pool.query(
      `SELECT a.*, j.title AS job_title, c.name AS company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.student_id = ?`,
      [req.params.id]
    );

    return res.json({
      student: rows[0],
      skills,
      projects,
      certifications,
      applications
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
}

async function toggleStudentActive(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT u.id, u.is_active FROM users u JOIN students s ON s.user_id = u.id WHERE s.id = ?',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Student not found' });
    const next = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [next, rows[0].id]);
    return res.json({ message: next ? 'Student activated' : 'Student deactivated', is_active: next });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
}

async function listRecruiters(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name, u.email, u.phone, u.is_active, c.name AS company_name
       FROM recruiters r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN companies c ON c.id = r.company_id
       ORDER BY u.created_at DESC`
    );
    return res.json({ recruiters: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list recruiters', error: error.message });
  }
}

async function toggleRecruiterActive(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT u.id, u.is_active FROM users u JOIN recruiters r ON r.user_id = u.id WHERE r.id = ?',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Recruiter not found' });
    const next = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [next, rows[0].id]);
    return res.json({ message: next ? 'Recruiter activated' : 'Recruiter deactivated', is_active: next });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update recruiter', error: error.message });
  }
}

async function createRecruiter(req, res) {
  try {
    const { full_name, email, password, phone, company_id, designation } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.query(
        `INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, 'recruiter')`,
        [full_name, email.toLowerCase(), hashed, phone || null]
      );
      await connection.query(
        `INSERT INTO recruiters (user_id, company_id, designation) VALUES (?, ?, ?)`,
        [userResult.insertId, company_id || null, designation || null]
      );
      await connection.commit();
      return res.status(201).json({ message: 'Recruiter created', id: userResult.insertId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create recruiter', error: error.message });
  }
}

async function getStatistics(req, res) {
  try {
    const [[stats]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM students) AS total_students,
         (SELECT COUNT(*) FROM students WHERE is_placed = 1) AS placed_students,
         (SELECT COUNT(*) FROM applications WHERE status IN ('selected', 'offer')) AS selected_applications,
         (SELECT COUNT(*) FROM jobs) AS total_jobs,
         (SELECT AVG(package_lpa) FROM jobs WHERE package_lpa IS NOT NULL) AS avg_package`
    );

    const [byBranch] = await pool.query(
      `SELECT branch, COUNT(*) AS total,
              SUM(is_placed = 1) AS placed
       FROM students
       WHERE branch IS NOT NULL AND branch <> ''
       GROUP BY branch
       ORDER BY total DESC`
    );

    const [byCompany] = await pool.query(
      `SELECT c.name AS company_name, COUNT(a.id) AS applications,
              SUM(a.status IN ('selected', 'offer')) AS selected
       FROM companies c
       LEFT JOIN jobs j ON j.company_id = c.id
       LEFT JOIN applications a ON a.job_id = j.id
       GROUP BY c.id
       ORDER BY applications DESC`
    );

    return res.json({ stats, by_branch: byBranch, by_company: byCompany });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
}

async function exportStudents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.full_name, u.email, u.phone, s.college, s.course, s.branch, s.graduation_year,
              s.cgpa, s.is_placed
       FROM students s
       JOIN users u ON u.id = s.user_id
       ORDER BY u.full_name`
    );

    const header = 'Full Name,Email,Phone,College,Course,Branch,Graduation Year,CGPA,Placed\n';
    const body = rows
      .map((r) =>
        [
          r.full_name,
          r.email,
          r.phone || '',
          r.college || '',
          r.course || '',
          r.branch || '',
          r.graduation_year || '',
          r.cgpa || '',
          r.is_placed ? 'Yes' : 'No'
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    return res.send(header + body);
  } catch (error) {
    return res.status(500).json({ message: 'Export failed', error: error.message });
  }
}

async function listPlacedStudents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.full_name, u.email, s.branch, s.cgpa, s.graduation_year,
              c.name AS company_name, j.title AS job_title, j.package_lpa, a.status
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.status IN ('selected', 'offer') OR s.is_placed = 1
       ORDER BY u.full_name`
    );
    return res.json({ placed_students: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch placed students', error: error.message });
  }
}

module.exports = {
  getDashboard,
  listStudents,
  getStudentDetails,
  toggleStudentActive,
  listRecruiters,
  toggleRecruiterActive,
  createRecruiter,
  getStatistics,
  exportStudents,
  listPlacedStudents
};
