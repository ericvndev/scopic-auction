const CronJob = require('cron').CronJob;

const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Bill = require('../models/Bill');

const findWinnerAndLosers = (bids) => {
	const highestBid = bids
		.sort((bid1, bid2) => {
			bid2.amount - bid1.amount;
		})
		.pop();
	const winner = highestBid ? highestBid.user : {};
	const losers = bids.reduce(
		(result, bid) =>
			bid.user.username !== highestBid.user.username
				? [...result, bid.user]
				: result,
		[]
	);

	return { winner, highestBid, losers };
};

const generateContent = (item, winner) => {
	let and = '';
	if (!winner) {
		and = `And there was no one make a bid on this item.`;
	} else {
		and = `And the winner is "${winner.firstName} ${winner.lastName}"`;
	}
	return `The bidding time for item ${item.name} has just finished. ${and}`;
};

exports = module.exports = {
	init() {
		const job = new CronJob(
			'0 * * * * *',
			async function () {
				const now = Math.floor(Date.now() / 1000) * 1000;
				const foundJustEndedItems = await Item.find({
					$and: [
						{ closeDateTime: { $gte: new Date(now - 10000) } },
						{ closeDateTime: { $lte: new Date(now + 10000) } },
					],
				}) // buffer 10 seconds just for sure
					.exec();
				// need to use dataloader when huge amount of items end at same time
				for (const item of foundJustEndedItems) {
					const bids = await item.populateBids();
					const { winner, highestBid, losers } =
						findWinnerAndLosers(bids);
					await Notification.create(
						[winner, ...losers].map((user) => ({
							user: user.username,
							content: generateContent(item, winner),
						}))
					);
					await Bill.create({
						itemId: item._id,
						user: highestBid.user.username,
						amount: highestBid.amount,
						bid: highestBid._id,
					});
				}
			},
			null,
			true
		);
		this.job = job;
	},
	get job() {
		return this.job;
	},
};
