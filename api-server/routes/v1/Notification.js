const express = require('express');
const router = express.Router();

const authCheck = require('../../middlewares/auth');

const Notification = require('../../models/Notification');

router.get('/notifications', authCheck, async (req, res) => {
	if (!req.user) {
		return res.json({ error: 'Please login first' });
	}
	try {
		const notifications = await Notification.find({
			user: req.user.username,
		})
			.sort({ createdAt: -1 })
			.lean();
		res.json({ error: '', data: notifications });
	} catch (error) {
		res.json({ error: error.message });
	}
});

exports = module.exports = router;
