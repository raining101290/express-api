const express = require('express');
const router = express.Router();

// home route
router.get('/', (req, res) => {
  res.send('Hello World!');
});

module.exports = router;