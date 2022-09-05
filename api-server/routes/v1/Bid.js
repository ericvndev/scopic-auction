const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Bid = require('../../models/Bid');
const Item = require('../../models/Item');

const checkBid = (user, item, highestBid, amount) => {
	if (highestBid && highestBid.user === user.username) {
		throw new Error('Your latest bid is already the highest bid');
	}
	if (
		(highestBid && highestBid.amount >= amount) ||
		item.basePrice >= amount
	) {
		throw new Error(
			`Your bid must be higher than ${Math.max(
				highestBid && highestBid.amount,
				item.basePrice
			)}`
		);
	}
};

router.post('/bid', authCheck, async (req, res) => {
	try {
		const { itemId, amount } = req.body;
		const item = await Item.findOne({ _id: itemId });
		if (!item) {
			return res.json({ error: 'Item not found' });
		}
		const currentHighestBid = await Bid.findOne({ itemId: item._id }).sort({
			amount: -1,
		});
		checkBid(req.user, item, currentHighestBid, amount);
		const createdBid = await Bid.create({
			user: req.user.username,
			itemId,
			amount,
		});
		res.json({ error: '', data: createdBid });
	} catch (error) {
		res.json({ error: error.message });
	}
});

exports = module.exports = router;
