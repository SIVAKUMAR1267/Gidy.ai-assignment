const Log = require('../models/Log');

const REQUIRED_FIELDS = ['actor', 'role', 'action', 'resource', 'resourceType', 'ipAddress', 'region', 'severity', 'status', 'timestamp'];

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const uploadLogs = async (req, res) => {
  try {
    const logs = req.body;

    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Payload must be a JSON array' });
    }

    if (logs.length > 10000) {
      return res.status(400).json({ error: 'Maximum of 10,000 records allowed per request' });
    }

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
    let { 
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

    if (role) query.role = role;
    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (resourceType) query.resourceType = resourceType;
    if (region) query.region = region;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { actor: searchRegex },
        { resource: searchRegex },
        { action: searchRegex },
        { ipAddress: searchRegex }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    let limitNum = parseInt(limit, 10) || 20;
    if (limitNum > 100) limitNum = 100; // clamp limit to 100
    if (limitNum < 1) limitNum = 20;

    const total = await Log.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;
    
    let pageNum = parseInt(page, 10) || 1;
    if (pageNum > totalPages) pageNum = totalPages;
    if (pageNum < 1) pageNum = 1;

    let logs;

    // Use aggregation pipeline ONLY when custom sorting is requested
    if (sortBy === 'severity' || sortBy === 'status') {
      let sortPipeline = [];
      if (sortBy === 'severity') {
        sortPipeline = [
          {
            $addFields: {
              severityPriority: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$severity", "CRITICAL"] }, then: 4 },
                    { case: { $eq: ["$severity", "HIGH"] }, then: 3 },
                    { case: { $eq: ["$severity", "MEDIUM"] }, then: 2 },
                    { case: { $eq: ["$severity", "LOW"] }, then: 1 }
                  ],
                  default: 0
                }
              }
            }
          },
          { $sort: { severityPriority: sortOrder } }
        ];
      } else {
        sortPipeline = [
          {
            $addFields: {
              statusPriority: {
                $cond: { if: { $eq: ["$status", "Resolved"] }, then: 1, else: 2 }
              }
            }
          },
          { $sort: { statusPriority: sortOrder } }
        ];
      }

      logs = await Log.aggregate([
        { $match: query },
        ...sortPipeline,
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
      ]);
    } else {
      // Standard fast querying using lean() for other fields
      logs = await Log.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();
    }

    res.status(200).json({
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error while fetching logs' });
  }
};

const getFilters = async (req, res) => {
  try {
    const [roles, actions, severities, statuses, regions, resourceTypes] = await Promise.all([
      Log.distinct('role'),
      Log.distinct('action'),
      Log.distinct('severity'),
      Log.distinct('status'),
      Log.distinct('region'),
      Log.distinct('resourceType')
    ]);

    res.status(200).json({
      role: roles.sort(),
      action: actions.sort(),
      severity: severities.sort(),
      status: statuses.sort(),
      region: regions.sort(),
      resourceType: resourceTypes.sort()
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Internal server error while fetching filters' });
  }
};

module.exports = {
  uploadLogs,
  getLogs,
  getFilters
};
