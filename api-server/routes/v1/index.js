const express = require('express');
const router = express.Router();

const ItemRouter = require('./Item');

router.use('/', ItemRouter);

exports = module.exports = router;
