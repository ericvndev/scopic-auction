const express = require('express');
const router = express.Router();

const ItemRouter = require('./Item');
const UserRouter = require('./User');
const BidRouter = require('./Bid');

router.use('/', ItemRouter);
router.use('/', UserRouter);
router.use('/', BidRouter);

exports = module.exports = router;
