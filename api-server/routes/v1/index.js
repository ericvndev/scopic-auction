const express = require('express');
const router = express.Router();

const ItemRouter = require('./Item');
const UserRouter = require('./User');

router.use('/', ItemRouter);
router.use('/', UserRouter);

exports = module.exports = router;
