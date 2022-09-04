const jwt = require('jsonwebtoken');

const config = require('../config');

exports = module.exports = async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const [scheme, token] = authorization.split(' ');
	if (scheme === 'JWT') {
		try {
			const userInfo = await jwt.verify(token, config.secretKey);
			if (userInfo && userInfo.username) {
				req.user = userInfo;
			}
		} catch (error) {
			return res.status(401).json({ error: error.message });
		}
	}
	next();
};
