const mongoose = require('mongoose');
const UserStore = require('../data/users');
const userStore = UserStore.getInstance();

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

const calculateBudgetLeft = async (users) => {
	const rs = [];
	for (const user of users) {
		const budget = user.autobidBudget || 0;
		const foundBids = await mongoose
			.model('Bid')
			.find({ itemId: { $in: user.enableAutobid || [] } });
		if (foundBids) {
			const bidByItemId = {};
			foundBids.sort((a, b) => b.amount - a.amount);
			foundBids.forEach((bid) => {
				bidByItemId[bid.itemId] = bidByItemId[bid.itemId] || [];
				bidByItemId[bid.itemId].push(bid);
			});
			const userSpent = Object.keys(bidByItemId)
				.map((itemId) => bidByItemId[itemId][0])
				.filter((bid) => !!bid && bid.user === user.username)
				.reduce((total, bid) => total + bid.amount, 0);
			rs.push({ ...user, budgetLeft: Math.max(0, budget - userSpent) });
		} else {
			rs.push({ ...user, budgetLeft: budget });
		}
	}
	return rs;
};

// autobid handler
const checkAndGetNewBid = (document, sortedUsers) => {
	const [first, second] = sortedUsers;

	if (
		first.username !== document.user &&
		first.budgetLeft <= document.amount
	) {
		return null;
	}
	let newBid = {
		user: first.username,
		itemId: document.itemId,
		amount: document.amount + 1,
	};
	if (
		second &&
		second.budgetLeft &&
		second.budgetLeft > document.amount &&
		second.username !== document.user
	) {
		newBid = {
			user: second.username,
			itemId: document.itemId,
			amount: second.budgetLeft,
		};
	}
	if (newBid.user !== document.user) {
		return newBid;
	}
	return null;
};

bidSchema.post('save', async (document) => {
	try {
		const usersEnabledAutobid = userStore
			.getUsers()
			.filter(
				(user) =>
					user.enableAutobid &&
					user.enableAutobid.includes(`${document.itemId}`)
			);
		if (!usersEnabledAutobid.length) {
			return;
		}
		const calculatedUsers = await calculateBudgetLeft(usersEnabledAutobid);
		const sortedUsers = [...calculatedUsers].sort(
			(a, b) => b.budgetLeft - a.budgetLeft
		);

		let newBid = checkAndGetNewBid(document, sortedUsers);
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
