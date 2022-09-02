const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Item = require('../../models/Item');

router.get('/items', authCheck, async (req, res) => {
	const items = await Item.find();
	res.json(items);
});

exports = module.exports = router;
