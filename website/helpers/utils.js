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

const API_VERSION = 'v1';

const GET_FROM_API = async (path) => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/${API_VERSION}${path}`,
		{
			headers: {
				Authorization: `JWT ${localStorage.getItem('token')}`,
			},
		}
	);
	const { error, data } = await res.json();
	if (error) {
		throw new Error(error);
	}
	return data;
};

const POST_TO_API = async (path, body, method = 'POST') => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_HOST}/${API_VERSION}${path}`,
		{
			method,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `JWT ${localStorage.getItem('token')}`,
			},
			body: body ? JSON.stringify(body) : undefined,
		}
	);
	const { error, data } = await res.json();
	if (error) {
		throw new Error(error);
	}
	return data;
};

export { formatDate, GET_FROM_API, POST_TO_API };
