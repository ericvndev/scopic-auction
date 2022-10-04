const mongoose = require('mongoose');
const UserStore = require('../data/users');
const { sendMail } = require('../helpers/utils');
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

const calculateBudgetLeft = async (users, currentItemId) => {
	const rs = [];
	for (const user of users) {
		const budget = user.autobidBudget || 0;
		const autobidItems = await mongoose
			.model('Item')
			.find({
				$and: [
					{ _id: { $in: user.enableAutobid } },
					{ _id: { $ne: currentItemId } },
				],
			})
			.populate('highestBid')
			.lean();
		const userSpent = autobidItems
			.filter(
				(item) =>
					item.highestBid && item.highestBid.user === user.username
			)
			.reduce((total, item) => total + item.highestBid.amount, 0);
		rs.push({ ...user, budgetLeft: Math.max(0, budget - userSpent) });
	}
	return rs;
};

// autobid handler
const calculateNewAutobid = async (document, sortedUsers) => {
	let validUser = null;
	while (!validUser && sortedUsers.length) {
		const temp = sortedUsers.pop();
		if (temp.username !== document.user) {
			validUser = temp;
		}
	}

	if (validUser && validUser.budgetLeft < document.amount + 1) {
		return null;
	}

	let newBid = null;
	if (validUser) {
		newBid = {
			user: validUser.username,
			itemId: document.itemId,
			amount: sortedUsers.length //have another auto-bidding user has higher budget left
				? validUser.budgetLeft
				: document.amount + 1,
		};
	}

	return newBid;
};

const checkForOutOfBudgetUsers = async (users, amount) => {
	for (const user of users) {
		if (user.budgetLeft <= amount) {
			await mongoose.model('Notification').create({
				user: user.username,
				content: `Your auto-bidding budget has run out. Auto-bidding will now stop.`,
			});
			userStore.setUser({ username: user.username, enableAutobid: [] });
		}
	}
};

bidSchema.post('save', async (document) => {
	try {
		const autobidUsers = userStore
			.getUsers()
			.filter(
				(user) =>
					user.enableAutobid &&
					user.enableAutobid.includes(`${document.itemId}`)
			);
		if (!autobidUsers.length) {
			return;
		}
		const calculatedUsers = await calculateBudgetLeft(
			autobidUsers,
			document.itemId
		);
		const sortedUsers = [...calculatedUsers].sort(
			(a, b) => b.budgetLeft - a.budgetLeft
		);

		await checkForOutOfBudgetUsers(calculatedUsers, document.amount);
		let newBid = await calculateNewAutobid(document, sortedUsers);
		if (newBid) {
			await mongoose.model('Bid').create(newBid);
		}
	} catch (error) {
		console.log(error);
	}
});

// notify budget
bidSchema.post('save', async (document) => {
	try {
		const user = userStore.getUserByUsername(document.user);
		const [calculatedUser] = await calculateBudgetLeft([user]);
		if (
			(calculatedUser.budgetLeft / user.autobidBudget) * 100 <=
				100 - user.alertPercent &&
			!user.alerted
		) {
			await mongoose.model('Notification').create({
				user: user.username,
				content: `Your auto-bidding budget has reached ${calculatedUser.alertPercent}% reserved for bids`,
			});
			userStore.setUser({ username: user.username, alerted: true });
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
			.findOne({ _id: document.itemId });
		const user = userStore.getUserByUsername(document.user);
		if (foundItem && user) {
			try {
				sendMail(user.email, {
					subject: 'Scopic Auction Notification - New bid by you',
					html: `
				<html>
					<body>
						<p>Hi ${user.firstName},</p>
						<p>A new bid has been made by you on the item "${
							foundItem.name
						}" with the price at ${document.amount.toLocaleString()}. If it's not you or you think this is a mistake, please contact us as soon as you can to resolve the problem.</p>
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
	} catch (error) {
		console.log(error);
	}
});
bidSchema.post('save', async (document) => {
	try {
		const foundItem = await mongoose
			.model('Item')
			.findOne({ _id: document.itemId });
		if (foundItem) {
			global.io.to(foundItem.slug).emit('refetch');
			const bids = await mongoose
				.model('Bid')
				.find({ itemId: document.itemId })
				.lean();
			const usernames = {};
			bids.forEach((bid) => {
				if (!usernames[bid.user]) {
					usernames[bid.user] = true;
				}
			});
			const users = userStore.getUsersByUsername(Object.keys(usernames));
			const [bidUser] = users.splice(
				users.findIndex((user) => user.username === document.user),
				1
			);
			if (users.length) {
				await mongoose.model('Notification').create(
					users.map((user) => ({
						user: user.username,
						content: `A new bid on the item "${
							foundItem.name
						}" has been made by user ${
							bidUser.firstName
						} with the price at ${document.amount.toLocaleString()}USD`,
					}))
				);
			}
		}
	} catch (error) {
		console.log(error);
	}
});

const Bid = mongoose.model('Bid', bidSchema);

exports = module.exports = Bid;
