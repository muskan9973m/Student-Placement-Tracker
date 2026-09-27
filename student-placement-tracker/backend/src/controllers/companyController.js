const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const { getRecruiterByUserId } = require('../middleware/auth');

async function listCompanies(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
         (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id) AS jobs_count
       FROM companies c
       ORDER BY c.name`
    );
    return res.json({ companies: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to list companies', error: error.message });
  }
}

async function getCompany(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Company not found' });

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE company_id = ? ORDER BY created_at DESC', [
      req.params.id
    ]);
    return res.json({ company: rows[0], jobs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch company', error: error.message });
  }
}

async function createCompany(req, res) {
  try {
    const { name, website, description, location, industry, company_size } = req.body;
    if (!name) return res.status(400).json({ message: 'Company name is required' });

    const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;
    const [result] = await pool.query(
      `INSERT INTO companies (name, logo_path, website, description, location, industry, company_size, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, logoPath, website || null, description || null, location || null, industry || null, company_size || null, req.user.id]
    );

    return res.status(201).json({ message: 'Company created', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create company', error: error.message });
  }
}

async function updateCompany(req, res) {
  try {
    const companyId = req.params.id;
    const [existing] = await pool.query('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (!existing[0]) return res.status(404).json({ message: 'Company not found' });

    if (req.user.role === 'recruiter') {
      const recruiter = await getRecruiterByUserId(req.user.id);
      if (!recruiter || Number(recruiter.company_id) !== Number(companyId)) {
        return res.status(403).json({ message: 'You can only update your own company' });
      }
    }

    const { name, website, description, location, industry, company_size } = req.body;
    let logoPath = existing[0].logo_path;

    if (req.file) {
      if (logoPath) {
        const old = path.join(__dirname, '../../uploads/logos', path.basename(logoPath));
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      logoPath = `/uploads/logos/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE companies
       SET name = ?, logo_path = ?, website = ?, description = ?, location = ?, industry = ?, company_size = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        logoPath,
        website ?? existing[0].website,
        description ?? existing[0].description,
        location ?? existing[0].location,
        industry ?? existing[0].industry,
        company_size ?? existing[0].company_size,
        companyId
      ]
    );

    return res.json({ message: 'Company updated' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update company', error: error.message });
  }
}

async function deleteCompany(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete companies' });
    }
    await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Company deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete company', error: error.message });
  }
}

module.exports = {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
};
