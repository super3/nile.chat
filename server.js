const crypto = require('crypto');
const http = require('http');
const url = require('url');
const fs = require('mz/fs');
const axios = require('axios');
const Koa = require('koa');
const Static = require('koa-static');
const Socket = require('socket.io');

const redis = require('./lib/redis');

const User = require('./lib/User');
const Channel = require('./lib/Channel');
const Message = require('./lib/Message');

const app = new Koa();

app.use(Static('public'));

const server = http.createServer(app.callback());

const io = new Socket(server);

const users = [];

io.on('connection', socket => {
	socket.on('init', async (instance, userKey) => {
		users.push(socket);

		const user = await (async () => {
			const userId = await redis.get(`${instance}:user-key:${userKey}`);

			if(userId !== null) {
				const user = await User.get(instance, userId);

				return user;
			} else {
				const user = new User(instance);
				await user.save();

				const userKey = crypto.randomBytes(32).toString('base64');
				await redis.set(`${instance}:user-key:${userKey}`, user.id);

				socket.emit('user-key', userKey);

				return user;
			}
		})();

		socket.emit('user', user);

		for(const channel of await Channel.find(instance)) {
			socket.emit('channel', channel);
		}

		socket.on('channel', async name => {
			const channel = new Channel(instance, name);
			await channel.save();

			for(const user of users) {
				user.emit('channel', await Channel.get(instance, channel.id));
			}
		});

		socket.on('message', async (channelId, text) => {
			if(text.startsWith('/name')) {
				const name = text.split(' ')[1];

				const added = await redis.sadd(`${instance}:names`, name);

				if(added === 1) {
					await redis.srem(`${instance}:names`, user.name);

					user.name = name;
					await user.save();
				}

				socket.emit('user', user);
			}

			if(text.startsWith('/avatar')) {
				user.avatar = text.split(' ')[1] || undefined;
				await user.save();
			}

			const message = new Message(instance, channelId, user.id, text);
			await message.save();

			for(const user of users) {
				user.emit('message', await Message.get(instance, channelId, message.id), true);
			}

			if(text === '/help') {
				const message = new Message(instance, channelId, user.id, await fs.readFile(`${__dirname}/help-readme`, 'utf8'));
				await message.save();

				for(const user of users) {
					user.emit('message', await Message.get(instance, channelId, message.id));
				}
			}

			for(const word of text.trim().split(' ')) {
				const result = url.parse(word);

				if(result.hostname !== null) {
					const response = await axios.get(word, {
						// timeout: 5000,
						// maxContentLength: 2000
					});

					const contentType = response.headers['content-type'];

					if(contentType.startsWith('image')) {
						console.log('sending preview');

						for(const user of users) {
							user.emit('message-preview', instance, channelId, message.id, {
								type: 'image',
								url: word
							});
						}
					}
				}
			}
		});

		socket.on('disconnect', () => {
			users.splice(users.indexOf(socket), 1);
		});
	});
});

server.listen(3000);
