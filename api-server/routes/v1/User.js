const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const authCheck = require('../../middlewares/auth');

const User = require('../../models/User');
const UserStore = require('../../data/users');
const userStore = UserStore.getInstance();

router.post('/user/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = userStore
		.getUsers()
		.find((user) => user.username === username);
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

			return res.json({ error: '', accessToken: token });
		} catch (error) {
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

router.get('/user/me', authCheck, async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	res.json({
		error: '',
		data: {
			username: req.user.username,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
		},
	});
});

exports = module.exports = router;
