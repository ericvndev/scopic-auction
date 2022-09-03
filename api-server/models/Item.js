const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema(
	{
		slug: { type: String, unique: true },
		name: { type: String, index: true },
		description: { type: String, index: true },
		isDeactive: { type: Boolean, default: false },
		basePrice: Number,
		startDateTime: Date,
		closeDateTime: Date,
		images: [{ type: String }],
	},
	{
		timestamps: true,
	}
);

const Item = mongoose.model('Item', itemSchema);

exports = module.exports = Item;
