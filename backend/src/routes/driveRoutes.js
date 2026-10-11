const express = require('express');
const driveController = require('../controllers/driveController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, driveController.listDrives);
router.post('/', authenticate, authorize('admin'), driveController.createDrive);
router.put('/:id', authenticate, authorize('admin'), driveController.updateDrive);
router.delete('/:id', authenticate, authorize('admin'), driveController.deleteDrive);

module.exports = router;
