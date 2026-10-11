const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'recruiter'), applicationController.listApplications);
router.patch('/:id/status', authenticate, authorize('admin', 'recruiter'), applicationController.updateApplicationStatus);

module.exports = router;
