const mongoose = require('mongoose');
const seedData = require('./data-seeding');

const dbPath = process.env.MONGO_URL;

exports = module.exports = {
	connect: async () => {
		try {
			await mongoose.connect(dbPath);
			await seedData();
		} catch (error) {
			console.log(error);
		}
	},
};
