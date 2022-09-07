const express = require('express');
const path = require('path');
const router = express.Router();
const { slugify } = require('../../helpers/utils');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: function (req, file, cb) {
		const { name } = req.body;
		const slug = slugify(name);
		cb(null, `${slug}.${file.originalname.split('.').pop()}`);
	},
});
const upload = multer({ storage });

const authCheck = require('../../middlewares/auth');

const Item = require('../../models/Item');

const generateFilter = (searchString) => {
	return {
		$or: [
			{
				name: {
					$regex: `.*${searchString}.*`,
					$options: 'ig',
				},
			},
			{
				description: {
					$regex: `.*${searchString}.*`,
					$options: 'ig',
				},
			},
		],
	};
};

router.get('/items', authCheck, async (req, res) => {
	const { skip = '0', limit = '10', sort = '', search } = req.query;
	try {
		const sortArr = sort.split('_');
		const filter = search ? generateFilter(search) : {};

		const itemsCount = await Item.countDocuments(filter);
		let items = await Item.find(filter, null, {
			skip: parseInt(skip),
			limit: parseInt(limit),
			sort: sort
				? {
						[sortArr[0]]: sortArr[1] === 'asc' ? 1 : -1,
				  }
				: '',
		});

		res.json({
			error: '',
			data: {
				items,
				total: itemsCount,
			},
		});
	} catch (error) {
		res.json({ error: error.message });
	}
});

router.get('/item', authCheck, async (req, res) => {
	const { filter, populate } = req.query;
	const parsedFilter = JSON.parse(filter);

	try {
		const foundItem = await Item.findOne(parsedFilter);
		if (!foundItem) {
			return res.status(404).json({ error: 'Item not found' });
		}
		const data = foundItem.toJSON();

		if (populate) {
			const populateArr = populate.split(',');
			if (populateArr.includes('bids')) {
				const bids = await foundItem.populateBids();
				data.bids = bids;
			}
		}

		res.json({
			error: '',
			data,
		});
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

const itemValidation = async (newItem, req, isUpdate) => {
	const requiredFields = [
		'name',
		'description',
		'basePrice',
		'startDateTime',
		'closeDateTime',
	];
	for (const field of requiredFields) {
		if (!newItem[field]) {
			throw new Error(`${field} is required`);
		}
	}
	if (isNaN(newItem.basePrice) || newItem.basePrice < 0) {
		throw new Error('Not a valid base price');
	}
	if (new Date(newItem.startDateTime) > new Date(newItem.closeDateTime)) {
		throw new Error('Start date time must be before close date time');
	}
	if (isUpdate) {
		return;
	}
	if (!req.file) {
		throw new Error('Item image is required');
	}
	const checkName = await Item.exists({
		name: { $regex: new RegExp(newItem.name, 'i') },
	});
	if (checkName) {
		throw new Error(`Item "${newItem.name}" already exists`);
	}
};

router.post('/item', authCheck, upload.single('image'), async (req, res) => {
	const newItem = req.body;
	try {
		await itemValidation(newItem, req);
		newItem.images = [`/uploads/${req.file.filename}`];
		const updatedItem = await Item.create(newItem);
		res.json({ error: '', data: updatedItem });
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

router.delete('/item/:id', authCheck, async (req, res) => {
	const { id } = req.params;
	try {
		await Item.softDelete({ _id: id });
		res.json({ error: '', data: true });
	} catch (error) {
		console.log(error);
		res.json({ error: error.message });
	}
});

router.patch(
	'/item/:id',
	authCheck,
	upload.single('image'),
	async (req, res) => {
		const { id } = req.params;
		const newItem = req.body;
		try {
			await itemValidation(newItem, req, true);
			if (req.file) {
				newItem.images = [`/uploads/${req.file.filename}`];
			}
			if (newItem.name) {
				newItem.slug = slugify(newItem.name);
			}
			const updatedItem = await Item.updateOne({ _id: id }, newItem);
			res.json({ error: '', data: updatedItem });
		} catch (error) {
			console.log(error);
			res.json({ error: error.message });
		}
	}
);

exports = module.exports = router;
