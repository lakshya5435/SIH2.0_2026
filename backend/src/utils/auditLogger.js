const db = require('../config/db');

const logAction = async (actorId, action, targetResource, ipAddress = 'unknown') => {
  try {
    await db.query(
      'INSERT INTO audit_logs (actor_id, action, target_resource, ip_address) VALUES ($1, $2, $3, $4)',
      [actorId, action, targetResource, ipAddress]
    );
  } catch (error) {
    console.error('[AUDIT LOG ERROR] Failed to record action:', error);
    // In a production environment, you might want this to trigger a secondary alert
  }
};

module.exports = { logAction };