const express = require('express');
const router = express.Router();
const argon2 = require('argon2');

const authCheck = require('../../middlewares/auth');

const User = require('../../models/User');

const dummyUsers = [
	{
		username: 'user1',
		firstName: 'regular',
		lastName: 'user',
		hashedPassword:
			'$argon2id$v=19$m=4096,t=3,p=1$QIBh9J9ib2wxDrWVXlVafg$1ByXHv1T1cuEiyyXZ5DZPjofW2OAkSpnLniEyocu5QI', // user2
	},
	{
		username: 'admin1',
		firstName: 'admin',
		lastName: 'user',
		hashedPassword:
			'$argon2id$v=19$m=4096,t=3,p=1$vB7Gb6BOTE1alRrseQ+nPQ$xnB1GhZuEbOce1PgRAUO8Pp/wl85Pq3ymsYYU6pgiz8', // admin2
	},
];

router.post('/user/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = dummyUsers.find((user) => user.username === username);
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

router.get('/user/me', authCheck, async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const foundUser = dummyUsers.find(
		(user) => user.username === req.user.username
	);
	res.json({
		error: '',
		data: {
			username: foundUser.username,
			firstName: foundUser.firstName,
			lastName: foundUser.lastName,
		},
	});
});

exports = module.exports = router;
