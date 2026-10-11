const express = require('express');
const companyController = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');
const { logoUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', authenticate, companyController.listCompanies);
router.get('/:id', authenticate, companyController.getCompany);
router.post('/', authenticate, authorize('admin'), logoUpload.single('logo'), companyController.createCompany);
router.put('/:id', authenticate, authorize('admin', 'recruiter'), logoUpload.single('logo'), companyController.updateCompany);
router.delete('/:id', authenticate, authorize('admin'), companyController.deleteCompany);

module.exports = router;
