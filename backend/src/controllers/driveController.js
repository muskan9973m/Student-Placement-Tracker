const { pool } = require('../config/db');

async function listDrives(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.name AS company_name
       FROM placement_drives d
       JOIN companies c ON c.id = d.company_id
       ORDER BY d.drive_date DESC`
    );
    return res.json({ drives: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list drives', error: error.message });
  }
}

async function createDrive(req, res) {
  try {
    const {
      company_id,
      title,
      description,
      drive_date,
      venue,
      min_cgpa,
      allowed_branches,
      graduation_years,
      status
    } = req.body;

    if (!company_id || !title) {
      return res.status(400).json({ message: 'Company and title are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO placement_drives
       (company_id, title, description, drive_date, venue, min_cgpa, allowed_branches, graduation_years, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        title,
        description || null,
        drive_date || null,
        venue || null,
        min_cgpa || 0,
        allowed_branches || null,
        graduation_years || null,
        status || 'upcoming',
        req.user.id
      ]
    );

    return res.status(201).json({ message: 'Placement drive created', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create drive', error: error.message });
  }
}

async function updateDrive(req, res) {
  try {
    const fields = [
      'company_id',
      'title',
      'description',
      'drive_date',
      'venue',
      'min_cgpa',
      'allowed_branches',
      'graduation_years',
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
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    params.push(req.params.id);
    await pool.query(`UPDATE placement_drives SET ${updates.join(', ')} WHERE id = ?`, params);
    return res.json({ message: 'Drive updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update drive', error: error.message });
  }
}

async function deleteDrive(req, res) {
  try {
    await pool.query('DELETE FROM placement_drives WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Drive deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete drive', error: error.message });
  }
}

module.exports = {
  listDrives,
  createDrive,
  updateDrive,
  deleteDrive
};
