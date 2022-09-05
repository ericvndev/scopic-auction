const { Server } = require('socket.io');
const config = require('../config');

exports = module.exports = (httpServer) => {
	const io = new Server(httpServer, {
		cors: {
			origin: config.websiteHost,
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		const query = socket.handshake.query;
		if (query.item) {
			if (!socket.rooms.has(query.item)) {
				socket.join(query.item);
			}
		}
	});

	global.io = io;
};
