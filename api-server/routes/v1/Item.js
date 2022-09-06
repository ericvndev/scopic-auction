const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Item = require('../../models/Item');
const Bid = require('../../models/Bid');

const UserStore = require('../../data/users');
const userStore = UserStore.getInstance();

const generateFilter = (searchString) => {
	return {
		$or: [
			{
				name: {
					$regex: `.*${searchString}.*`,
					$options: 'ig',
				},
			},
			{
				description: {
					$regex: `.*${searchString}.*`,
					$options: 'ig',
				},
			},
		],
	};
};

router.get('/items', authCheck, async (req, res) => {
	const { skip = '0', limit = '10', sort = '', search } = req.query;
	try {
		const sortArr = sort.split('_');
		const filter = search ? generateFilter(search) : {};

		const itemsCount = await Item.countDocuments(filter);
		const items = await Item.find(filter, null, {
			skip: parseInt(skip),
			limit: parseInt(limit),
			sort: sort
				? {
						[sortArr[0]]: sortArr[1] === 'asc' ? 1 : -1,
				  }
				: '',
		});

		res.json({
			error: '',
			data: {
				items,
				total: itemsCount,
			},
		});
	} catch (error) {
		res.json({ error: error.message });
	}
});

const populateBids = async (item) => {
	if (!item) {
		return [];
	}
	const foundRelatedBids = await Bid.find({ itemId: item._id }).lean();
	const users = userStore.getUsersByUsername(
		foundRelatedBids.map((bid) => bid.user)
	);
	const usersMap = {};
	users.forEach((user) => (usersMap[user.username] = user));
	return foundRelatedBids.map((bid) => ({
		...bid,
		user: usersMap[bid.user],
	}));
};

router.get('/item', authCheck, async (req, res) => {
	const { filter, populate } = req.query;
	const parsedFilter = JSON.parse(filter);

	try {
		const foundItem = await Item.findOne(parsedFilter).lean();

		if (foundItem && populate) {
			const populateArr = populate.split(',');
			if (populateArr.includes('bids')) {
				foundItem.bids = await populateBids(foundItem);
			}
		}

		res.json({
			error: '',
			data: foundItem,
		});
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

router.delete('/item/:id', authCheck, async (req, res) => {
	const { id } = req.params;
	try {
		await Item.softDelete({ _id: id });
		res.json({ error: '', data: true });
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

exports = module.exports = router;
