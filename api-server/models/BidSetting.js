const mongoose = require('mongoose');

const { Schema } = mongoose;

const bidSettingSchema = new Schema(
	{
		user: { type: String },
		itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
		enableAutoBid: { type: Boolean, default: false },
		maximumAutoBidAmount: { type: Number, required: true },
		alertPercent: { type: Number },
	},
	{
		timestamps: true,
	}
);

const BidSetting = mongoose.model('BidSetting', bidSettingSchema);

exports = module.exports = BidSetting;
