const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const db = require('./data/conn');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/version', (req, res) => {
	res.json({ version: '1.0' });
});

app.use('/v1', require('./routes/v1'));

app.listen(port, async () => {
	try {
		// perform a database connection when server starts
		await db.connect();
		console.log(`Server is running on port: ${port}`);
	} catch (error) {
		console.log(error);
	}
});
