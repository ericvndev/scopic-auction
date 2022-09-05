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

// autobid handler

const checkAndGetNewBid = (document, sortedBidSettings) => {
	const [first, second] = sortedBidSettings;

	if (
		first.user !== document.user &&
		first.maximumAutoBidAmount <= document.amount
	) {
		return null;
	}
	let newBid = {
		user: first.user,
		itemId: document.itemId,
		amount: document.amount + 1,
	};
	if (
		second &&
		second.maximumAutoBidAmount &&
		second.maximumAutoBidAmount > document.amount
	) {
		newBid = {
			users: second.user,
			itemId: document.itemId,
			amount: second.maximumAutoBidAmount,
		};
	}
	if (newBid.user !== document.user) {
		return newBid;
	}
	return null;
};

bidSchema.post('save', async (document) => {
	try {
		const foundAllBidSettings = await mongoose
			.model('BidSetting')
			.find({ itemId: document.itemId, enableAutoBid: true })
			.lean();
		if (!foundAllBidSettings.length) {
			return;
		}
		const sortedBidSettings = foundAllBidSettings.sort((a, b) =>
			b.maximumAutoBidAmount === a.maximumAutoBidAmount
				? a.createdAt - b.createdAt
				: b.maximumAutoBidAmount - a.maximumAutoBidAmount
		);

		let newBid = checkAndGetNewBid(document, sortedBidSettings);
		if (newBid) {
			await mongoose.model('Bid').create(newBid);
		}
	} catch (error) {
		console.log(error);
	}
});

// notify bid change
bidSchema.post('save', async (document) => {
	try {
		const foundItem = await mongoose
			.model('Item')
			.findOne({ _id: document.itemId })
			.lean();
		if (foundItem) {
			global.io.to(foundItem.slug).emit('refetch');
		}
	} catch (error) {
		console.log(error);
	}
});

const Bid = mongoose.model('Bid', bidSchema);

exports = module.exports = Bid;
