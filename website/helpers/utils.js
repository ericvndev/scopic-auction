const formatDate = (d) => {
	const date = new Date(d);

	if (isNaN(date)) {
		return '';
	}

	return (
		`0${date.getHours()}`.slice(-2) +
		':' +
		`0${date.getMinutes()}`.slice(-2) +
		':' +
		`0${date.getSeconds()}`.slice(-2) +
		` - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
	);
};

export { formatDate };
