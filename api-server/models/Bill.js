const mongoose = require('mongoose');
const UserStore = require('../data/users');
const { sendMail, formatDate } = require('../helpers/utils');
const userStore = UserStore.getInstance();

const Item = require('./Item');

const { Schema } = mongoose;

const billSchema = new Schema(
	{
		user: { type: String },
		itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
		amount: Number,
		issueDate: { type: Date },
		bidId: { type: Schema.Types.ObjectId, ref: 'Bid' },
	},
	{
		timestamps: true,
	}
);

billSchema.post('save', async (document) => {
	const fullUser = userStore.getUserByUsername(document.user);
	const item = await Item.findById(document.itemId).lean();
	if (fullUser && item) {
		try {
			await sendMail(fullUser.email, {
				subject: 'Scopic Auction Bill',
				html: `
				<html>
				<body>
					<p>Congratulations ${fullUser.firstName} ${fullUser.lastName}!</p>
					<p>You are the winner in the bidding on the item ${
						item.name
					}. Below is the bill for your winning bid:</p>

					<p>Issue Date: ${formatDate(new Date(document.issueDate))}</p>
					<table>
						<thead>
							<tr>
								<th style="text-align: left">Name</th>
								<th style="text-align: center; padding: 0 20px">Amount</th>
								<th style="text-align: right">Final Price (USD)</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td style="text-align: left">${item.name}</td>
								<td style="text-align: center">1</td>
								<td style="text-align: right">${document.amount.toLocaleString()}</td>
							</tr>
						</tbody>
					</table>
					<p>
					<strong>Total: ${document.amount.toLocaleString()}USD</strong>
					</p>
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
});

const Bill = mongoose.model('Bill', billSchema);

exports = module.exports = Bill;
