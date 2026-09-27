const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { getStudentByUserId } = require('../middleware/auth');
const { calcProfileCompletion, studentEligibleForJob } = require('../utils/helpers');

async function getDashboard(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const [[counts]] = await pool.query(
      `SELECT
         COUNT(*) AS total_applications,
         SUM(status IN ('shortlisted', 'interview', 'selected', 'offer')) AS shortlisted,
         SUM(status = 'interview') AS interviews,
         SUM(status IN ('selected', 'offer')) AS offers
       FROM applications WHERE student_id = ?`,
      [student.id]
    );

    const [skills] = await pool.query('SELECT COUNT(*) AS c FROM student_skills WHERE student_id = ?', [student.id]);
    const [projects] = await pool.query('SELECT COUNT(*) AS c FROM student_projects WHERE student_id = ?', [student.id]);
    const [certs] = await pool.query('SELECT COUNT(*) AS c FROM student_certifications WHERE student_id = ?', [student.id]);

    const [userRows] = await pool.query('SELECT full_name, email, phone FROM users WHERE id = ?', [req.user.id]);
    const profile = { ...student, ...userRows[0] };
    const completion = calcProfileCompletion(profile, skills[0].c, projects[0].c, certs[0].c);

    const [recentApplications] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, j.title AS job_title, c.name AS company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC LIMIT 5`,
      [student.id]
    );

    const [upcomingInterviews] = await pool.query(
      `SELECT i.*, j.title AS job_title, c.name AS company_name
       FROM interviews i
       JOIN applications a ON a.id = i.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.student_id = ? AND i.status = 'scheduled' AND i.interview_date >= NOW()
       ORDER BY i.interview_date ASC LIMIT 5`,
      [student.id]
    );

    const [drives] = await pool.query(
      `SELECT d.*, c.name AS company_name
       FROM placement_drives d
       JOIN companies c ON c.id = d.company_id
       WHERE d.status IN ('upcoming', 'ongoing')
       ORDER BY d.drive_date ASC LIMIT 5`
    );

    const [jobs] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.location AS company_location
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       WHERE j.status = 'open'
       ORDER BY j.created_at DESC`
    );

    const eligibleJobs = jobs.filter((job) => studentEligibleForJob(student, job)).slice(0, 5);

    return res.json({
      student_name: userRows[0].full_name,
      profile_completion: completion,
      resume_uploaded: Boolean(student.resume_path),
      stats: {
        applications: Number(counts.total_applications || 0),
        shortlisted: Number(counts.shortlisted || 0),
        interviews: Number(counts.interviews || 0),
        offers: Number(counts.offers || 0)
      },
      recent_applications: recentApplications,
      upcoming_interviews: upcomingInterviews,
      upcoming_drives: drives,
      eligible_jobs: eligibleJobs
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const [userRows] = await pool.query(
      'SELECT full_name, email, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    const [skills] = await pool.query('SELECT * FROM student_skills WHERE student_id = ?', [student.id]);
    const [projects] = await pool.query('SELECT * FROM student_projects WHERE student_id = ?', [student.id]);
    const [certifications] = await pool.query('SELECT * FROM student_certifications WHERE student_id = ?', [student.id]);

    const profile = { ...student, ...userRows[0] };
    const completion = calcProfileCompletion(profile, skills.length, projects.length, certifications.length);

    return res.json({
      profile,
      skills,
      projects,
      certifications,
      profile_completion: completion
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
}

async function updatePersonal(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { full_name, phone, date_of_birth, address } = req.body;
    await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [
      full_name || req.user.full_name,
      phone || null,
      req.user.id
    ]);
    await pool.query(
      'UPDATE students SET date_of_birth = ?, address = ? WHERE id = ?',
      [date_of_birth || null, address || null, student.id]
    );

    return res.json({ message: 'Personal information updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Update failed', error: error.message });
  }
}

async function updateAcademic(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const {
      college,
      degree,
      course,
      branch,
      graduation_year,
      cgpa,
      class10_percentage,
      class12_percentage
    } = req.body;

    await pool.query(
      `UPDATE students SET
         college = ?, degree = ?, course = ?, branch = ?, graduation_year = ?,
         cgpa = ?, class10_percentage = ?, class12_percentage = ?
       WHERE id = ?`,
      [
        college || null,
        degree || course || null,
        course || degree || null,
        branch || null,
        graduation_year || null,
        cgpa ?? null,
        class10_percentage ?? null,
        class12_percentage ?? null,
        student.id
      ]
    );

    return res.json({ message: 'Academic information updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Update failed', error: error.message });
  }
}

async function addSkill(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { skill_name } = req.body;
    if (!skill_name) return res.status(400).json({ message: 'Skill name is required' });

    const [result] = await pool.query(
      'INSERT INTO student_skills (student_id, skill_name) VALUES (?, ?)',
      [student.id, skill_name.trim()]
    );
    return res.status(201).json({ message: 'Skill added', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add skill', error: error.message });
  }
}

async function deleteSkill(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    await pool.query('DELETE FROM student_skills WHERE id = ? AND student_id = ?', [
      req.params.id,
      student.id
    ]);
    return res.json({ message: 'Skill deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete skill', error: error.message });
  }
}

async function addProject(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const { title, description, technologies, github_url, live_url } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });

    const [result] = await pool.query(
      `INSERT INTO student_projects (student_id, title, description, technologies, github_url, live_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student.id, title, description || null, technologies || null, github_url || null, live_url || null]
    );
    return res.status(201).json({ message: 'Project added', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add project', error: error.message });
  }
}

async function updateProject(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const { title, description, technologies, github_url, live_url } = req.body;
    await pool.query(
      `UPDATE student_projects
       SET title = ?, description = ?, technologies = ?, github_url = ?, live_url = ?
       WHERE id = ? AND student_id = ?`,
      [title, description || null, technologies || null, github_url || null, live_url || null, req.params.id, student.id]
    );
    return res.json({ message: 'Project updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
}

async function deleteProject(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    await pool.query('DELETE FROM student_projects WHERE id = ? AND student_id = ?', [
      req.params.id,
      student.id
    ]);
    return res.json({ message: 'Project deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
}

async function addCertification(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const { certificate_name, issuing_organization, issue_date } = req.body;
    if (!certificate_name) return res.status(400).json({ message: 'Certificate name is required' });

    const [result] = await pool.query(
      `INSERT INTO student_certifications (student_id, certificate_name, issuing_organization, issue_date)
       VALUES (?, ?, ?, ?)`,
      [student.id, certificate_name, issuing_organization || null, issue_date || null]
    );
    return res.status(201).json({ message: 'Certification added', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add certification', error: error.message });
  }
}

async function deleteCertification(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    await pool.query('DELETE FROM student_certifications WHERE id = ? AND student_id = ?', [
      req.params.id,
      student.id
    ]);
    return res.json({ message: 'Certification deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete certification', error: error.message });
  }
}

async function uploadResume(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    if (!req.file) return res.status(400).json({ message: 'Resume file is required' });

    if (student.resume_path) {
      const oldPath = path.join(__dirname, '../../uploads/resumes', path.basename(student.resume_path));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const resumePath = `/uploads/resumes/${req.file.filename}`;
    await pool.query('UPDATE students SET resume_path = ? WHERE id = ?', [resumePath, student.id]);
    return res.json({ message: 'Resume uploaded successfully', resume_path: resumePath });
  } catch (error) {
    return res.status(500).json({ message: 'Resume upload failed', error: error.message });
  }
}

async function getJobs(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const [jobs] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.website, c.industry, c.location AS company_location
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       WHERE j.status = 'open'
       ORDER BY j.created_at DESC`
    );

    const [applications] = await pool.query(
      'SELECT job_id, status FROM applications WHERE student_id = ?',
      [student.id]
    );
    const appMap = Object.fromEntries(applications.map((a) => [a.job_id, a.status]));

    const enriched = jobs.map((job) => ({
      ...job,
      eligible: studentEligibleForJob(student, job),
      applied: Boolean(appMap[job.id]),
      application_status: appMap[job.id] || null
    }));

    const eligibleOnly = req.query.eligible === 'true';
    return res.json({ jobs: eligibleOnly ? enriched.filter((j) => j.eligible) : enriched });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
}

async function applyJob(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const jobId = req.params.jobId;

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ? AND status = ?', [jobId, 'open']);
    if (!jobs[0]) return res.status(404).json({ message: 'Job not found or closed' });

    if (!studentEligibleForJob(student, jobs[0])) {
      return res.status(400).json({ message: 'You are not eligible for this job based on criteria' });
    }

    if (!student.resume_path) {
      return res.status(400).json({ message: 'Please upload your resume before applying' });
    }

    try {
      await pool.query(
        'INSERT INTO applications (job_id, student_id, status) VALUES (?, ?, ?)',
        [jobId, student.id, 'applied']
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'You have already applied for this job' });
      }
      throw error;
    }

    return res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Application failed', error: error.message });
  }
}

async function getApplications(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const [rows] = await pool.query(
      `SELECT a.*, j.title AS job_title, j.package_lpa, j.location, c.name AS company_name
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [student.id]
    );
    return res.json({ applications: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
}

async function getDrives(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.name AS company_name, c.industry
       FROM placement_drives d
       JOIN companies c ON c.id = d.company_id
       ORDER BY d.drive_date ASC`
    );
    return res.json({ drives: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch drives', error: error.message });
  }
}

async function getInterviews(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    const [rows] = await pool.query(
      `SELECT i.*, j.title AS job_title, c.name AS company_name
       FROM interviews i
       JOIN applications a ON a.id = i.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = j.company_id
       WHERE a.student_id = ?
       ORDER BY i.interview_date DESC`,
      [student.id]
    );
    return res.json({ interviews: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch interviews', error: error.message });
  }
}

async function getStatistics(req, res) {
  try {
    const [[overall]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM students) AS total_students,
         (SELECT COUNT(*) FROM students WHERE is_placed = 1) AS placed_students,
         (SELECT COUNT(*) FROM companies) AS total_companies,
         (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS open_jobs,
         (SELECT COUNT(*) FROM applications) AS total_applications`
    );

    const student = await getStudentByUserId(req.user.id);
    const [[mine]] = await pool.query(
      `SELECT
         COUNT(*) AS my_applications,
         SUM(status IN ('selected', 'offer')) AS my_offers
       FROM applications WHERE student_id = ?`,
      [student.id]
    );

    return res.json({ overall, mine });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
}

module.exports = {
  getDashboard,
  getProfile,
  updatePersonal,
  updateAcademic,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  deleteCertification,
  uploadResume,
  getJobs,
  applyJob,
  getApplications,
  getDrives,
  getInterviews,
  getStatistics
};
