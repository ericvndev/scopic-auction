const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const BidSetting = require('../../models/BidSetting');
const Item = require('../../models/Item');

router.get('/bid-settings', authCheck, async (req, res) => {
	if (!req.user) {
		return [];
	}
	try {
		const foundBidSettings = await BidSetting.find({
			user: req.user.username,
		}).populate('itemId', 'name slug');
		res.json({ error: '', data: foundBidSettings });
	} catch (error) {
		res.json({ error: error.message });
	}
});

const validateBidSetting = (item, maximumAutoBidAmount, alertPercent) => {
	if (!item) {
		throw new Error('Item not found');
	}
	if (item.basePrice > maximumAutoBidAmount) {
		throw new Error(
			`Maximum autobid amount must be higher than ${item.basePrice}`
		);
	}
	if (isNaN(alertPercent) || alertPercent < 0 || alertPercent > 100) {
		throw new Error('Invalid alert percentage');
	}
};

router.put('/bid-setting', authCheck, async (req, res) => {
	if (!req.user) {
		throw new Error('Please login first');
	}
	try {
		const { _id, enableAutoBid, maximumAutoBidAmount, alertPercent } =
			req.body;
		const foundBidSetting = await BidSetting.findById(_id);
		if (!foundBidSetting) {
			throw new Error('Setting not found');
		}
		const foundItem = await Item.findById(foundBidSetting.itemId).lean();
		validateBidSetting(foundItem, maximumAutoBidAmount, alertPercent);
		foundBidSetting.enableAutoBid = !!enableAutoBid;
		foundBidSetting.maximumAutoBidAmount = maximumAutoBidAmount;
		foundBidSetting.alertPercent = alertPercent;
		foundBidSetting.save(null, (err, updatedSetting) => {
			if (err) {
				throw err;
			}
			return res.json({ error: '', data: updatedSetting });
		});
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

exports = module.exports = router;
