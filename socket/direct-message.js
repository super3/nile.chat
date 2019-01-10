const DirectMessage = require('../lib/DirectMessage');

module.exports = ({ socket, instance, name, subscribe, user }) => {
	socket.on('direct-message', async (to, text) => {
		const message = new DirectMessage(instance, to, user.id, text);
		await message.save();
	});

	subscribe(`${instance}:direct-message:${user.id}`, async (to, from, id) => {
		socket.emit('direct-message', await DirectMessage.get(instance, to, from, id));
	});
};
