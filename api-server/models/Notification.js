const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema(
	{
		user: { type: String, required: true },
		content: { type: String },
	},
	{
		timestamps: true,
	}
);

notificationSchema.post('save', (document) => {
	global.io.to(document.user).emit('refetch-noti');
});

const Notification = mongoose.model('Notification', notificationSchema);

exports = module.exports = Notification;
