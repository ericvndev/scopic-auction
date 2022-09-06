const utils = require('../helpers/utils');
const add = require('date-fns/add');
const endOfDay = require('date-fns/endOfDay');

const items = require('./items.json');
const Item = require('../models/Item');

exports = module.exports = async () => {
	// seed only when  there is no items
	const countItems = await Item.countDocuments();
	if (!countItems) {
		await Item.create(
			items.map((item) => {
				const slug = utils.slugify(item.name);

				return {
					...item,
					slug: utils.slugify(item.name),
					startDateTime: new Date(2022, 8, 1, 0, 0, 0),
					closeDateTime: endOfDay(add(new Date(), { days: 30 })),
					images: [`/uploads/${slug}.jpg`],
				};
			})
		);
		console.log('Data seeded with ', items.length, ' items');
	}
};
