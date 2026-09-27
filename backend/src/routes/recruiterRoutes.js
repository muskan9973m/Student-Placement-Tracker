const express = require('express');
const recruiterController = require('../controllers/recruiterController');
const { authenticate, authorize } = require('../middleware/auth');
const { logoUpload } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate, authorize('recruiter'));

router.get('/dashboard', recruiterController.getDashboard);
router.get('/company', recruiterController.getCompanyProfile);
router.put('/company', logoUpload.single('logo'), recruiterController.createOrUpdateCompany);
router.get('/selected-students', recruiterController.getSelectedStudents);

module.exports = router;
