const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		username: { type: String, unique: true, required: true },
		firstName: { type: String },
		lastName: { type: String },
		hashedPassword: { type: String },
		isDeleted: { type: Boolean, default: false },
		enableAutobid: [{ type: String }],
		autobidBudget: Number,
		budgetAlertPercent: Number,
	},
	{
		timestamps: true,
	}
);

userSchema.statics.generateToken = function (user) {
	const token = jwt.sign(
		{
			username: user.username,
		},
		config.secretKey,
		{
			expiresIn: '1 day',
		}
	);
	return token;
};

const User = mongoose.model('User', userSchema);

exports = module.exports = User;
