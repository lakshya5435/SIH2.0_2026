const express = require('express');
const router = express.Router();
const { submitAssessment, getAssessmentsQueue } = require('../controllers/assessmentController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Apply token verification to all routes in this file
router.use(verifyToken);

// Students can submit their own assessments
router.post('/', requireRole(['student']), submitAssessment);

// Only Counsellors and Admins can view the triage queue
router.get('/queue', requireRole(['counsellor', 'admin']), getAssessmentsQueue);

module.exports = router;