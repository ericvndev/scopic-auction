const nodemailer = require('nodemailer');

const replaceVNCharacter = (st) => {
	let str = st;

	str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
	str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
	str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
	str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
	str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
	str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
	str = str.replace(/(đ)/g, 'd');

	return str;
};

const slugify = (st) => {
	let str = st.toString().toLowerCase().trim();

	// Replace Vietnamese characters (I'm a vietnamese so just in case)
	str = replaceVNCharacter(str);

	// Remove special characters
	str = str.replace(/([^0-9a-z-\s.])/g, '');

	// Replace space with -
	str = str.replace(/([\s.]+)/g, '-');

	// Remove duplicate -
	str = str.replace(/-+/g, '-');

	// Remove - at the beginning
	str = str.replace(/^-+/g, '');

	// Remove - at the end
	str = str.replace(/-+$/g, '');

	return str;
};

const sendMail = (to, { subject, html }) => {
	return new Promise((resolve, reject) => {
		if (!to || !html) {
			reject(new Error('Invalid email options'));
		}
		if (!process.env.ADMIN_EMAIL_APP_PASSWORD) {
			reject(
				new Error(
					'You must set ADMIN_EMAIL_APP_PASSWORD in then .env file'
				)
			);
		}
		const transporter = nodemailer.createTransport({
			host: 'smtp.googlemail.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.ADMIN_EMAIL,
				pass: process.env.ADMIN_EMAIL_APP_PASSWORD,
			},
		});

		const mailOptions = {
			from: process.env.ADMIN_EMAIL,
			to: to,
			subject: subject,
			html: html,
		};

		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
				reject(error);
			} else {
				console.log('Email sent: ' + info.response);
				resolve(info.response);
			}
		});
	});
};

const formatDate = (d) => {
	const date = new Date(d);
	return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${
		date.getMonth() + 1
	}/${date.getFullYear()}`;
};

exports = module.exports = {
	slugify,
	sendMail,
	formatDate,
};
