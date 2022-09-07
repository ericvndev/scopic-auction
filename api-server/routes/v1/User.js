const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const authCheck = require('../../middlewares/auth');

const User = require('../../models/User');
const UserStore = require('../../data/users');
const Item = require('../../models/Item');
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
