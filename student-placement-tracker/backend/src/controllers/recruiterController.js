const { pool } = require('../config/db');
const { getRecruiterByUserId } = require('../middleware/auth');

async function getDashboard(req, res) {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter profile not found' });

    const companyId = recruiter.company_id || 0;
    const [[stats]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM jobs WHERE company_id = ?) AS total_jobs,
         (SELECT COUNT(*) FROM jobs WHERE company_id = ? AND status = 'open') AS open_jobs,
         (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = ?) AS total_applicants,
         (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = ? AND a.status = 'shortlisted') AS shortlisted,
         (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = ? AND a.status IN ('selected', 'offer')) AS selected,
         (SELECT COUNT(*) FROM interviews i JOIN applications a ON a.id = i.application_id JOIN jobs j ON j.id = a.job_id WHERE j.company_id = ? AND i.status = 'scheduled') AS interviews`,
      [companyId, companyId, companyId, companyId, companyId, companyId]
    );

    const [companyRows] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);
    const [recentApplicants] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, u.full_name AS student_name, j.title AS job_title
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN jobs j ON j.id = a.job_id
       WHERE j.company_id = ?
       ORDER BY a.applied_at DESC LIMIT 8`,
      [companyId]
    );

    return res.json({
      stats,
      company: companyRows[0] || null,
      designation: recruiter.designation,
      recent_applicants: recentApplicants
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load recruiter dashboard', error: error.message });
  }
}

async function getCompanyProfile(req, res) {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);
    if (!recruiter?.company_id) {
      return res.json({ company: null, message: 'No company linked yet' });
    }
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [recruiter.company_id]);
    return res.json({ company: rows[0] || null, designation: recruiter.designation });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch company profile', error: error.message });
  }
}

async function createOrUpdateCompany(req, res) {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);
    const { name, website, description, location, industry, company_size, designation } = req.body;
    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : undefined;

    if (!recruiter.company_id) {
      if (!name) return res.status(400).json({ message: 'Company name is required' });
      const [result] = await pool.query(
        `INSERT INTO companies (name, logo_path, website, description, location, industry, company_size, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, logoPath || null, website || null, description || null, location || null, industry || null, company_size || null, req.user.id]
      );
      await pool.query('UPDATE recruiters SET company_id = ?, designation = ? WHERE id = ?', [
        result.insertId,
        designation || recruiter.designation,
        recruiter.id
      ]);
      return res.status(201).json({ message: 'Company profile created', id: result.insertId });
    }

    const [existing] = await pool.query('SELECT * FROM companies WHERE id = ?', [recruiter.company_id]);
    await pool.query(
      `UPDATE companies
       SET name = ?, logo_path = COALESCE(?, logo_path), website = ?, description = ?, location = ?, industry = ?, company_size = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        logoPath || null,
        website ?? existing[0].website,
        description ?? existing[0].description,
        location ?? existing[0].location,
        industry ?? existing[0].industry,
        company_size ?? existing[0].company_size,
        recruiter.company_id
      ]
    );

    if (designation !== undefined) {
      await pool.query('UPDATE recruiters SET designation = ? WHERE id = ?', [designation, recruiter.id]);
    }

    return res.json({ message: 'Company profile updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save company profile', error: error.message });
  }
}

async function getSelectedStudents(req, res) {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);
    const [rows] = await pool.query(
      `SELECT u.full_name, u.email, u.phone, s.branch, s.cgpa, s.graduation_year,
              j.title AS job_title, a.status, a.updated_at
       FROM applications a
       JOIN students s ON s.id = a.student_id
       JOIN users u ON u.id = s.user_id
       JOIN jobs j ON j.id = a.job_id
       WHERE j.company_id = ? AND a.status IN ('selected', 'offer')
       ORDER BY a.updated_at DESC`,
      [recruiter?.company_id || 0]
    );
    return res.json({ selected_students: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch selected students', error: error.message });
  }
}

module.exports = {
  getDashboard,
  getCompanyProfile,
  createOrUpdateCompany,
  getSelectedStudents
};
