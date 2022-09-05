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

bidSchema.post('save', async (document) => {
	const foundItem = await mongoose
		.model('Item')
		.findOne({ _id: document.itemId })
		.lean();
	if (foundItem) {
		global.io.to(foundItem.slug).emit('refetch');
	}
});

const Bid = mongoose.model('Bid', bidSchema);

exports = module.exports = Bid;
