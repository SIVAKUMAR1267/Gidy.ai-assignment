const express = require('express');
const router = express.Router();
const { uploadLogs, getLogs, getFilters } = require('../controllers/logController');

router.post('/bulk', uploadLogs);
router.get('/filters', getFilters);
router.get('/', getLogs);

module.exports = router;
