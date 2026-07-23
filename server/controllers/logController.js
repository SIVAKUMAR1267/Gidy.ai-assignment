const Log = require('../models/Log');

const REQUIRED_FIELDS = ['actor', 'role', 'action', 'resource', 'resourceType', 'ipAddress', 'region', 'severity', 'status', 'timestamp'];

const uploadLogs = async (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Payload must be a JSON array' });
    }

    if (logs.length > 10000) {
      return res.status(400).json({ error: 'Maximum of 10,000 records allowed per request' });
    }

    // Validate fields and timestamp
    for (const log of logs) {
      for (const field of REQUIRED_FIELDS) {
        if (log[field] === undefined || log[field] === null || log[field] === '') {
          return res.status(400).json({ error: `Missing required field: ${field} in one of the records` });
        }
      }
      
      const date = new Date(log.timestamp);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid timestamp format in one of the records' });
      }
    }

    await Log.insertMany(logs);
    res.status(201).json({ message: `Successfully inserted ${logs.length} records` });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    res.status(500).json({ error: 'Internal server error during bulk upload' });
  }
};

const getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'timestamp', 
      order = 'desc',
      role,
      action,
      severity,
      status,
      resourceType,
      region
    } = req.query;

    const query = {};

    // Filters
    if (role) query.role = role;
    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (resourceType) query.resourceType = resourceType;
    if (region) query.region = region;

    // Search (across actor, resource, action, ipAddress)
    if (search) {
      query.$or = [
        { actor: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Log.countDocuments(query)
    ]);

    res.status(200).json({
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error while fetching logs' });
  }
};

module.exports = {
  uploadLogs,
  getLogs
};
