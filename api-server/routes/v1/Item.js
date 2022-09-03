const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Item = require('../../models/Item');

router.get('/items/count', async (req, res) => {
	const itemsCount = await Item.countDocuments();
	res.json({ total: itemsCount });
});

router.get('/items', authCheck, async (req, res) => {
	const { skip, limit } = req.query;

	const items = await Item.find({}, null, {
		skip: parseInt(skip),
		limit: parseInt(limit),
	});

	res.json(items);
});

exports = module.exports = router;
