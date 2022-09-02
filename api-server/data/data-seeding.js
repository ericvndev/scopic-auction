const { mongoose } = require('mongoose');

const items = require('./items.json');

const Item = require('../models/Item');

exports = module.exports = async () => {
	// check if seeded
	const firstItem = await Item.findOne({ slug: 'acient-bottle' });
	if (!firstItem) {
		await Item.create(items);
	}
};
