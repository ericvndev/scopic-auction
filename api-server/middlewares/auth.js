const jwt = require('jsonwebtoken');

const config = require('../config');
const UserStore = require('../data/users');

const userStore = UserStore.getInstance();

const methodMap = {
	GET: 'READ',
	PATCH: 'EDIT',
	PUT: 'EDIT',
	DELETE: 'DELETE',
	POST: 'CREATE',
};

const accessControl = {
	admin: {
		items: ['CREATE', 'READ', 'EDIT', 'DELETE'],
		item: ['CREATE', 'READ', 'EDIT', 'DELETE'],
	},
	user: {
		items: ['READ'],
		item: ['READ'],
	},
};

const handleJWTToken = async (token) => {
	const userInfo = await jwt.verify(token, config.secretKey);
	const foundUser = userStore.getUserByUsername(userInfo.username);
	if (foundUser) {
		if (foundUser.blacklist && foundUser.blacklist.includes(token)) {
			throw new Error('Invalid token');
		}
		return foundUser;
	}
	throw new Error('User not found');
};

const checkAccessControl = (req) => {
	const { user } = req;
	if (!user || !user.role) {
		throw new Error('Unauthorized');
	}

	const { role } = user;
	const { method, url } = req;
	const [, resource] = url.split(/[/?]/);

	if (
		accessControl[role][resource] &&
		!accessControl[role][resource].includes(methodMap[method])
	) {
		throw new Error('Unauthorized');
	}
};

exports = module.exports = async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	try {
		const [scheme, token] = authorization.split(' ');
		if (scheme === 'JWT') {
			req.user = await handleJWTToken(token);
		}
		checkAccessControl(req);
	} catch (error) {
		return res.status(401).json({ error: error.message });
	}
	next();
};
