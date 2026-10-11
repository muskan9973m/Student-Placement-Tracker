require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seedDemo() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [companies] = await connection.query(`SELECT id FROM companies WHERE name = 'Infosys'`);
    let companyId = companies[0]?.id;
    if (!companyId) {
      const [result] = await connection.query(
        `INSERT INTO companies (name, website, description, location, industry, company_size)
         VALUES ('Infosys', 'https://www.infosys.com', 'Global IT services company', 'Bangalore', 'IT', '10000+')`
      );
      companyId = result.insertId;
    }

    const [jobs] = await connection.query(`SELECT id FROM jobs WHERE title = 'Graduate Engineer Trainee' AND company_id = ?`, [companyId]);
    if (!jobs.length) {
      await connection.query(
        `INSERT INTO jobs
         (company_id, created_by, title, description, location, job_type, package_lpa, openings, min_cgpa, allowed_branches, graduation_years, required_skills, application_deadline, status)
         VALUES (?, 1, 'Graduate Engineer Trainee', 'Entry level software role for campus hires', 'Bangalore', 'full-time', 4.5, 10, 6.5, 'CSE, IT, ECE', '2026,2027', 'Java, SQL, DSA', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'open')`,
        [companyId]
      );
    }

    const [drives] = await connection.query(`SELECT id FROM placement_drives WHERE title = 'Infosys Campus Drive'`);
    if (!drives.length) {
      await connection.query(
        `INSERT INTO placement_drives
         (company_id, title, description, drive_date, venue, min_cgpa, allowed_branches, graduation_years, status, created_by)
         VALUES (?, 'Infosys Campus Drive', 'On-campus hiring drive', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Seminar Hall A', 6.5, 'CSE, IT', '2026,2027', 'upcoming', 1)`,
        [companyId]
      );
    }

    await connection.commit();
    console.log('Demo company, job and drive seeded (if missing).');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedDemo().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exit(1);
});
