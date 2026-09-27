const { pool } = require('../config/db');
const { getRecruiterByUserId } = require('../middleware/auth');

async function listApplications(req, res) {
  try {
    let sql = `
      SELECT a.*, u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
             s.branch, s.cgpa, s.graduation_year, s.resume_path,
             j.title AS job_title, c.name AS company_name, c.id AS company_id
      FROM applications a
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      JOIN jobs j ON j.id = a.job_id
      JOIN companies c ON c.id = j.company_id
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      sql += ' AND c.id = ?';
      params.push(recruiter?.company_id || 0);
    }

    if (req.query.status) {
      sql += ' AND a.status = ?';
      params.push(req.query.status);
    }
    if (req.query.job_id) {
      sql += ' AND a.job_id = ?';
      params.push(req.query.job_id);
    }

    sql += ' ORDER BY a.applied_at DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ applications: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list applications', error: error.message });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { status, notes } = req.body;
    const allowed = ['applied', 'shortlisted', 'rejected', 'interview', 'selected', 'offer'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [rows] = await pool.query(
      `SELECT a.*, j.company_id
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (Number(recruiter?.company_id) !== Number(rows[0].company_id)) {
        return res.status(403).json({ message: 'Not allowed to update this application' });
      }
    }

    await pool.query('UPDATE applications SET status = ?, notes = ? WHERE id = ?', [
      status,
      notes || null,
      req.params.id
    ]);

    if (status === 'selected' || status === 'offer') {
      await pool.query('UPDATE students SET is_placed = 1 WHERE id = ?', [rows[0].student_id]);
    }

    return res.json({ message: 'Application status updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update application', error: error.message });
  }
}

module.exports = {
  listApplications,
  updateApplicationStatus
};
