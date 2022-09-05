const mongoose = require('mongoose');

const { Schema } = mongoose;

const bidSchema = new Schema(
	{
		user: { type: String },
		itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
		amount: Number,
	},
	{
		timestamps: true,
	}
);

const Bid = mongoose.model('Bid', bidSchema);

exports = module.exports = Bid;
