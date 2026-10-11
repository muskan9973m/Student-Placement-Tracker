const { pool } = require('../config/db');
const { getRecruiterByUserId } = require('../middleware/auth');

async function listJobs(req, res) {
  try {
    let sql = `
      SELECT j.*, c.name AS company_name,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicants_count
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      sql += ' AND j.company_id = ?';
      params.push(recruiter?.company_id || 0);
    }

    if (req.query.status) {
      sql += ' AND j.status = ?';
      params.push(req.query.status);
    }

    sql += ' ORDER BY j.created_at DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ jobs: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list jobs', error: error.message });
  }
}

async function getJob(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.website, c.industry
       FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Job not found' });
    return res.json({ job: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
}

async function createJob(req, res) {
  try {
    const {
      company_id,
      title,
      description,
      location,
      job_type,
      package_lpa,
      openings,
      min_cgpa,
      allowed_branches,
      graduation_years,
      required_skills,
      application_deadline,
      status
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Job title is required' });

    let finalCompanyId = company_id;
    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (!recruiter?.company_id) {
        return res.status(400).json({ message: 'Recruiter has no linked company profile' });
      }
      finalCompanyId = recruiter.company_id;
    }

    if (!finalCompanyId) return res.status(400).json({ message: 'Company is required' });

    const [result] = await pool.query(
      `INSERT INTO jobs
       (company_id, created_by, title, description, location, job_type, package_lpa, openings,
        min_cgpa, allowed_branches, graduation_years, required_skills, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalCompanyId,
        req.user.id,
        title,
        description || null,
        location || null,
        job_type || 'full-time',
        package_lpa || null,
        openings || 1,
        min_cgpa || 0,
        allowed_branches || null,
        graduation_years || null,
        required_skills || null,
        application_deadline || null,
        status || 'open'
      ]
    );

    return res.status(201).json({ message: 'Job created', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
}

async function updateJob(req, res) {
  try {
    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (Number(recruiter?.company_id) !== Number(existing[0].company_id)) {
        return res.status(403).json({ message: 'You can only update your company jobs' });
      }
    }

    const fields = [
      'title',
      'description',
      'location',
      'job_type',
      'package_lpa',
      'openings',
      'min_cgpa',
      'allowed_branches',
      'graduation_years',
      'required_skills',
      'application_deadline',
      'status'
    ];

    const updates = [];
    const params = [];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (req.user.role === 'admin' && req.body.company_id !== undefined) {
      updates.push('company_id = ?');
      params.push(req.body.company_id);
    }

    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });

    params.push(req.params.id);
    await pool.query(`UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.json({ message: 'Job updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
}

async function deleteJob(req, res) {
  try {
    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (Number(recruiter?.company_id) !== Number(existing[0].company_id)) {
        return res.status(403).json({ message: 'You can only delete your company jobs' });
      }
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Job deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
}

module.exports = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
};
