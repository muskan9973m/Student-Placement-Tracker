const { pool } = require('../config/db');
const { getRecruiterByUserId } = require('../middleware/auth');

async function listInterviews(req, res) {
  try {
    let sql = `
      SELECT i.*, a.status AS application_status, u.full_name AS student_name,
             j.title AS job_title, c.name AS company_name, c.id AS company_id
      FROM interviews i
      JOIN applications a ON a.id = i.application_id
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

    sql += ' ORDER BY i.interview_date DESC';
    const [rows] = await pool.query(sql, params);
    return res.json({ interviews: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list interviews', error: error.message });
  }
}

async function scheduleInterview(req, res) {
  try {
    const { application_id, round_name, interview_date, mode, location_or_link } = req.body;
    if (!application_id || !round_name || !interview_date) {
      return res.status(400).json({ message: 'Application, round name and date are required' });
    }

    const [apps] = await pool.query(
      `SELECT a.*, j.company_id FROM applications a
       JOIN jobs j ON j.id = a.job_id WHERE a.id = ?`,
      [application_id]
    );
    if (!apps[0]) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (Number(recruiter?.company_id) !== Number(apps[0].company_id)) {
        return res.status(403).json({ message: 'Not allowed for this application' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO interviews
       (application_id, round_name, interview_date, mode, location_or_link, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [application_id, round_name, interview_date, mode || 'online', location_or_link || null, req.user.id]
    );

    await pool.query(`UPDATE applications SET status = 'interview' WHERE id = ?`, [application_id]);

    return res.status(201).json({ message: 'Interview scheduled', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
  }
}

async function updateInterview(req, res) {
  try {
    const fields = ['round_name', 'interview_date', 'mode', 'location_or_link', 'status', 'feedback'];
    const updates = [];
    const params = [];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE interviews SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.json({ message: 'Interview updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update interview', error: error.message });
  }
}

async function deleteInterview(req, res) {
  try {
    await pool.query('DELETE FROM interviews WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Interview deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete interview', error: error.message });
  }
}

module.exports = {
  listInterviews,
  scheduleInterview,
  updateInterview,
  deleteInterview
};
