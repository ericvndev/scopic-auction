const jwt = require('jsonwebtoken');

const config = require('../config');
const UserStore = require('../data/users');

const userStore = UserStore.getInstance();

const handleJWTToken = async (token) => {
	const userInfo = await jwt.verify(token, config.secretKey);
	const foundUser = userStore
		.getUsers()
		.find((user) => user.username === userInfo.username);
	if (foundUser) {
		if (foundUser.blacklist && foundUser.blacklist.includes(token)) {
			throw new Error('Invalid token');
		}
		return foundUser;
	}
	throw new Error('User not found');
};

exports = module.exports = async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const [scheme, token] = authorization.split(' ');
	if (scheme === 'JWT') {
		try {
			req.user = await handleJWTToken(token);
		} catch (error) {
			return res.status(401).json({ error: error.message });
		}
	}
	next();
};
