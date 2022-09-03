const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Item = require('../../models/Item');

router.get('/items/count', async (req, res) => {
	try {
		const itemsCount = await Item.countDocuments();
		res.json({ error: '', total: itemsCount });
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/items', async (req, res) => {
	const { skip, limit } = req.query;
	try {
		const items = await Item.find({}, null, {
			skip: parseInt(skip),
			limit: parseInt(limit),
		});

		res.json({
			error: '',
			data: items,
		});
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/item', async (req, res) => {
	const { filter } = req.query;
	const parsedFilter = JSON.parse(filter);

	try {
		const foundItem = await Item.findOne(parsedFilter);

		res.json({
			error: '',
			data: foundItem,
		});
	} catch (error) {
		res.json({ error: error.message });
	}
});

exports = module.exports = router;
