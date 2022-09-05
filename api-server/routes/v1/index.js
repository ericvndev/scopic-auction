const express = require('express');
const router = express.Router();

const ItemRouter = require('./Item');
const UserRouter = require('./User');
const BidRouter = require('./Bid');
const BidSettingRouter = require('./BidSetting');

router.use('/', ItemRouter);
router.use('/', UserRouter);
router.use('/', BidRouter);
router.use('/', BidSettingRouter);

exports = module.exports = router;
