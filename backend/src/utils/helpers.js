function calcProfileCompletion(student, skillsCount, projectsCount, certificationsCount) {
  const checks = [
    Boolean(student.full_name || student.name),
    Boolean(student.email),
    Boolean(student.phone),
    Boolean(student.date_of_birth),
    Boolean(student.address),
    Boolean(student.college),
    Boolean(student.degree || student.course),
    Boolean(student.branch),
    Boolean(student.graduation_year),
    student.cgpa !== null && student.cgpa !== undefined,
    student.class10_percentage !== null && student.class10_percentage !== undefined,
    student.class12_percentage !== null && student.class12_percentage !== undefined,
    skillsCount > 0,
    projectsCount > 0,
    certificationsCount > 0,
    Boolean(student.resume_path)
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function studentEligibleForJob(student, job) {
  const minCgpa = Number(job.min_cgpa || 0);
  const studentCgpa = Number(student.cgpa || 0);
  if (studentCgpa < minCgpa) return false;

  const branches = parseList(job.allowed_branches);
  if (branches.length > 0 && student.branch && !branches.some((b) => b.toLowerCase() === String(student.branch).toLowerCase())) {
    return false;
  }

  const years = parseList(job.graduation_years).map(Number);
  if (years.length > 0 && student.graduation_year && !years.includes(Number(student.graduation_year))) {
    return false;
  }

  return true;
}

module.exports = {
  calcProfileCompletion,
  parseList,
  studentEligibleForJob
};
