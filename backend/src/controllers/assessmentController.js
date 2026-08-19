const db = require('../config/db');
const { logAction } = require('../utils/auditLogger');

// POST: Submit a new assessment (Student only)
const submitAssessment = async (req, res) => {
  const { answers } = req.body;
  const userId = req.user.id;

  try {
    // 1. Calculate Standard PHQ-9 Score
    // Assumes answers is an array of 9 integers (0-3)
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    
    // 2. Clinical Risk Categorization
    let riskLevel = 'Low';
    if (totalScore >= 20) riskLevel = 'Severe';
    else if (totalScore >= 15) riskLevel = 'Moderately Severe';
    else if (totalScore >= 10) riskLevel = 'Moderate';
    else if (totalScore >= 5) riskLevel = 'Mild';

    // 3. Crisis Protocol Override (Item 9: Thoughts of self-harm)
    const selfHarmIndicator = answers[8];
    if (selfHarmIndicator > 0) {
      riskLevel = 'Critical_Crisis';
    }

    // 4. Save to Database
    const result = await db.query(
      'INSERT INTO assessments (user_id, answers, total_score, risk_level) VALUES ($1, $2, $3, $4) RETURNING id, total_score, risk_level, status',
      [userId, JSON.stringify(answers), totalScore, riskLevel]
    );

    // 5. Create Audit Trail
    await logAction(userId, 'SUBMIT_ASSESSMENT', `Assessment ID: ${result.rows[0].id}`, req.ip);

    res.status(201).json({
      message: 'Assessment submitted successfully.',
      data: result.rows[0],
      crisisFlag: riskLevel === 'Critical_Crisis' // Tells frontend to show emergency numbers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process assessment.' });
  }
};

// GET: Retrieve assessments for the triage queue (Counsellor/Admin only)
const getAssessmentsQueue = async (req, res) => {
  try {
    // Counsellors need to see high-risk patients first
    const result = await db.query(`
      SELECT a.id, a.total_score, a.risk_level, a.status, a.created_at, u.email 
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      ORDER BY 
        CASE a.risk_level 
          WHEN 'Critical_Crisis' THEN 1
          WHEN 'Severe' THEN 2
          WHEN 'Moderately Severe' THEN 3
          WHEN 'Moderate' THEN 4
          WHEN 'Mild' THEN 5
          ELSE 6
        END,
        a.created_at ASC
    `);

    // Audit Trail: Log that a staff member viewed the PII queue
    await logAction(req.user.id, 'VIEW_TRIAGE_QUEUE', 'Assessments Table', req.ip);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assessments.' });
  }
};

module.exports = { submitAssessment, getAssessmentsQueue };