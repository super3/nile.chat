const Message = require('../lib/Message');

module.exports = ({ socket, instance, name, subscribe }) => {
	socket.on('message', async (channelId, text) => {
		if (text.startsWith('/name')) {
			const name = text.split(' ')[1];

			const added = await redis.sadd(`${instance}:names`, name.toLowerCase());

			if (added === 1) {
				await redis.srem(`${instance}:names`, user.name.toLowerCase());

				user.name = name;
				await user.save();
			}

			socket.emit('user', user);
		}

		if (text.startsWith('/avatar')) {
			user.avatar = text.split(' ')[1] || undefined;
			await user.save();
		}

		const message = new Message(instance, channelId, user.id, text);
		await message.save();

		if (text === '/help') {
			const message = new Message(instance, channelId, user.id, await fs.readFile(`${__dirname}/help-readme`, 'utf8'));
			await message.save();

			for (const user of users) {
				user.emit('message', await Message.get(instance, channelId, message.id));
			}
		}

		for (const word of text.trim().split(' ')) {
			const result = url.parse(word);

			if (result.hostname !== null) {
				const response = await axios.get(word, {
					// Timeout: 5000,
					// maxContentLength: 2000
				});

				const contentType = response.headers['content-type'];

				if (contentType.startsWith('image')) {
					for (const user of users) {
						const preview = {
							type: 'image',
							url: word
						};

						user.emit('message-preview', instance, channelId, message.id, preview);
						message.preview = preview;

						await message.save();
					}
				}
			}
		}
	});

	subscribe(`${instance}:message`, async (channelId, id) => {
		socket.emit('message', await Message.get(instance, channelId, id), true);
	});
};
