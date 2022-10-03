const mongoose = require('mongoose');
const { sendMail } = require('../helpers/utils');

const { Schema } = mongoose;

const UserStore = require('../data/users');
const userStore = UserStore.getInstance();

const notificationSchema = new Schema(
	{
		user: { type: String, required: true },
		content: { type: String },
	},
	{
		timestamps: true,
	}
);

notificationSchema.post('save', async (document) => {
	global.io.to(document.user).emit('refetch-noti');
	const user = userStore.getUserByUsername(document.user);
	if (user) {
		try {
			await sendMail(user.email, {
				subject: 'Scopic Auction Notification',
				html: `
				<html>
				<body>
					<p>Hi ${user.firstName},</p>
					<p>${document.content}</p>
					<p>
						Best Regards,<br />
						Scopic Auction Teams
					</p>
				</body>
				</html>
			`,
			});
		} catch (error) {
			console.log(error);
		}
	}
});

const Notification = mongoose.model('Notification', notificationSchema);

exports = module.exports = Notification;
