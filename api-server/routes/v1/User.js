const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const authCheck = require('../../middlewares/auth');

const User = require('../../models/User');
const UserStore = require('../../data/users');
const Item = require('../../models/Item');
const Bid = require('../../models/Bid');
const Bill = require('../../models/Bill');
const userStore = UserStore.getInstance();

router.post('/user/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = userStore.getUserByUsername(username);
	if (foundUser) {
		try {
			const checkPassword = await argon2.verify(
				foundUser.hashedPassword,
				password
			);
			if (!checkPassword) {
				throw new Error('Invalid password');
			}

			const token = User.generateToken(foundUser);

			return res.json({ error: '', data: token });
		} catch (error) {
			console.log(error);
			return res.status(401).json({ error: error.message });
		}
	}

	res.status(401).json({ error: 'User not found' });
});

router.post('/user/logout', authCheck, async (req, res) => {
	const auth = req.headers.authorization;
	if (auth && req.user) {
		const [, token] = auth.split(' ');
		const newUser = { ...req.user };
		newUser.blacklist = newUser.blacklist || [];
		newUser.blacklist.push(token);
		userStore.setUser(newUser);
	}
	res.json({ error: '' });
});

const populateAutobidItems = async (user) => {
	const items = await Item.find({
		_id: { $in: user.enableAutobid },
	})
		.populate({ path: 'highestBid' })
		.lean()
		.exec();
	const usernames = items
		.map((item) => (item.highestBid || {}).user)
		.filter((username) => !!username);
	const users = userStore.getUsersByUsername(usernames);
	return items.map((item) => ({
		...item,
		highestBid: item.highestBid
			? {
					...item.highestBid,
					user: users.find(
						(user) => user.username === item.highestBid.user
					),
			  }
			: null,
	}));
};

const populateBidItems = async (user) => {
	const bidByUser = await Bid.find({ user: user.username });
	const itemIds = {};

	bidByUser.forEach((bid) => {
		if (!itemIds[bid.itemId]) {
			itemIds[bid.itemId] = true;
		}
	});

	const bidItems = await Item.find({ _id: { $in: Object.keys(itemIds) } })
		.populate({ path: 'highestBid' })
		.lean()
		.exec();
	console.log(bidItems);

	return bidItems;
};

const populateBill = async (user) => {
	const bill = await Bill.find({ user: user.username }).lean();
	return bill;
};

router.get('/user/me', authCheck, async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const { populate } = req.query;

	const user = { ...req.user };
	delete user.hashedPassword;
	if (populate) {
		const populateArr = populate.split(',');
		if (populateArr.includes('autobidItems')) {
			user.autobidItems = await populateAutobidItems(user);
		}
		if (populateArr.includes('bidItems')) {
			user.bidItems = await populateBidItems(user);
		}
		if (populateArr.includes('bills')) {
			user.bills = await populateBill(user);
		}
	}

	res.json({
		error: '',
		data: user,
	});
});

router.patch('/user/me', authCheck, async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	if (req.body.autobidBudget || req.body.alertPercent) {
		req.body.alerted = false;
	}

	const user = userStore.getUserByUsername(req.user.username);
	const newUser = { ...user, ...req.body };
	const updatedUser = userStore.setUser(newUser);

	res.json({
		error: '',
		data: updatedUser,
	});
});

exports = module.exports = router;
