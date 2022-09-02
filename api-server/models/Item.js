const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = new Schema(
	{
		name: String,
		slug: String,
	},
	{
		timestamps: true,
	}
);

const Item = mongoose.model('Item', itemSchema);

exports = module.exports = Item;
