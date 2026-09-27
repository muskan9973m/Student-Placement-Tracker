const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/students', adminController.listStudents);
router.get('/students/export', adminController.exportStudents);
router.get('/students/placed', adminController.listPlacedStudents);
router.get('/students/:id', adminController.getStudentDetails);
router.patch('/students/:id/toggle-active', adminController.toggleStudentActive);

router.get('/recruiters', adminController.listRecruiters);
router.post('/recruiters', adminController.createRecruiter);
router.patch('/recruiters/:id/toggle-active', adminController.toggleRecruiterActive);

router.get('/statistics', adminController.getStatistics);

module.exports = router;
