const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'recruiter'), jobController.listJobs);
router.get('/:id', authenticate, jobController.getJob);
router.post('/', authenticate, authorize('admin', 'recruiter'), jobController.createJob);
router.put('/:id', authenticate, authorize('admin', 'recruiter'), jobController.updateJob);
router.delete('/:id', authenticate, authorize('admin', 'recruiter'), jobController.deleteJob);

module.exports = router;
