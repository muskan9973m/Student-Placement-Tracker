const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate, authorize('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.put('/profile/personal', studentController.updatePersonal);
router.put('/profile/academic', studentController.updateAcademic);

router.post('/skills', studentController.addSkill);
router.delete('/skills/:id', studentController.deleteSkill);

router.post('/projects', studentController.addProject);
router.put('/projects/:id', studentController.updateProject);
router.delete('/projects/:id', studentController.deleteProject);

router.post('/certifications', studentController.addCertification);
router.delete('/certifications/:id', studentController.deleteCertification);

router.post('/resume', resumeUpload.single('resume'), studentController.uploadResume);

router.get('/jobs', studentController.getJobs);
router.post('/jobs/:jobId/apply', studentController.applyJob);
router.get('/applications', studentController.getApplications);
router.get('/drives', studentController.getDrives);
router.get('/interviews', studentController.getInterviews);
router.get('/statistics', studentController.getStatistics);

module.exports = router;
