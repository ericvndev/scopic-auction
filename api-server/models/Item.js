const mongoose = require('mongoose');
const { slugify } = require('../helpers/utils');

const { Schema } = mongoose;

const UserStore = require('../data/users');
const userStore = UserStore.getInstance();

const itemSchema = new Schema(
	{
		slug: {
			type: String,
			default: function () {
				return slugify(this.name);
			},
		},
		name: { type: String, index: true },
		description: { type: String, index: true },
		isDeactive: { type: Boolean, default: false },
		deleted: { type: Boolean, default: false },
		basePrice: Number,
		startDateTime: Date,
		closeDateTime: Date,
		images: [{ type: String }],
	},
	{
		timestamps: true,
	}
);

const findNotDeleted = function (next) {
	const filter = this.getQuery();
	const newFilter = {
		$and: [
			{
				...filter,
			},
			{
				deleted: { $ne: true },
			},
		],
	};
	this.setQuery(newFilter);
	next();
};

itemSchema.pre('find', findNotDeleted);
itemSchema.pre('findOne', findNotDeleted);
itemSchema.pre('countDocuments', findNotDeleted);

itemSchema.statics.softDelete = async (filter) => {
	return await Item.updateMany(filter, { $set: { deleted: true } });
};

itemSchema.virtual('highestBid', {
	ref: 'Bid',
	localField: '_id',
	foreignField: 'itemId',
	justOne: true,
	options: { sort: { amount: -1 } },
});

itemSchema.methods.populateBids = async function () {
	const foundRelatedBids = await mongoose
		.model('Bid')
		.find({ itemId: this._id })
		.lean();
	const users = userStore.getUsersByUsername(
		foundRelatedBids.map((bid) => bid.user)
	);
	const usersMap = {};
	users.forEach((user) => (usersMap[user.username] = user));
	return foundRelatedBids.map((bid) => ({
		...bid,
		user: usersMap[bid.user],
	}));
};

itemSchema.post('updateOne', async function (result) {
	try {
		if (result.modifiedCount === 1) {
			const query = this.getQuery();
			const fullItem = await mongoose.model('Item').findOne(query);
			if (fullItem) {
				global.io.to(fullItem.slug).emit('refetch');
			}
		}
	} catch (error) {
		console.log(error);
	}
});

const Item = mongoose.model('Item', itemSchema);

exports = module.exports = Item;
