const express = require('express');
const router = express.Router();

const ItemRouter = require('./Item');
const UserRouter = require('./User');
const BidRouter = require('./Bid');
const NotificationRouter = require('./Notification');

router.use('/', ItemRouter);
router.use('/', UserRouter);
router.use('/', BidRouter);
router.use('/', NotificationRouter);

exports = module.exports = router;
