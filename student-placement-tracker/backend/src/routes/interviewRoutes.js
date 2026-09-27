const express = require('express');
const interviewController = require('../controllers/interviewController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'recruiter'), interviewController.listInterviews);
router.post('/', authenticate, authorize('admin', 'recruiter'), interviewController.scheduleInterview);
router.put('/:id', authenticate, authorize('admin', 'recruiter'), interviewController.updateInterview);
router.delete('/:id', authenticate, authorize('admin', 'recruiter'), interviewController.deleteInterview);

module.exports = router;
