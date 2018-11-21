const crypto = require('crypto');
const http = require('http');
const url = require('url');
const fs = require('mz/fs');
const axios = require('axios');
const Koa = require('koa');
const koaStatic = require('koa-static');
const Socket = require('socket.io');

const redis = require('./lib/redis');

const User = require('./lib/User');
const Channel = require('./lib/Channel');
const Message = require('./lib/Message');
const DirectMessage = require('./lib/DirectMessage');

const app = new Koa();

app.use(koaStatic('public'));

const server = http.createServer(app.callback());

const io = new Socket(server);

const users = [];
const userSockets = [];

io.on('connection', socket => {
	// eslint-disable-next-line no-use-before-define
	socket.on('init', async (instance, userKey) => {
		users.push(socket);

		const user = await (async userKey => {
			if(userKey) {
				const userId = await redis.get(`${instance}:user-key:${userKey}`);

				if (userId !== null) {
					const user = await User.get(instance, userId);

					return user;
				}
			}

			const user = new User(instance);
			await user.save();

			userKey = crypto.randomBytes(32).toString('base64');
			await redis.set(`${instance}:user-key:${userKey}`, user.id);

			socket.emit('user-key', userKey);

			return user;
		})(userKey);

		await user.goOnline();

		userSockets[user.id] = socket;

		socket.emit('user', user);
		socket.emit('online', await User.findOnline(instance));
		socket.emit('direct-messages', await DirectMessage.findDirects(instance, user.id));

		const onlineInterval = setInterval(async () => {
			socket.emit('online', await User.findOnline(instance));
		}, 30 * 1000);

		socket.on('disconnect', () => {
			clearInterval(onlineInterval);
		});

		for(const channel of await Channel.find(instance)) {
			socket.emit('channel', channel);
		}

		socket.on('channel', async name => {
			const channel = new Channel(instance, name);
			await channel.save();

			for (const user of users) {
				user.emit('channel', await Channel.get(instance, channel.id));
			}
		});

		socket.on('message', async (channelId, text) => {
			if (text.startsWith('/name')) {
				const name = text.split(' ')[1];

				const added = await redis.sadd(`${instance}:names`, name);

				if (added === 1) {
					await redis.srem(`${instance}:names`, user.name);

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

			for (const user of users) {
				user.emit('message', await Message.get(instance, channelId, message.id), true);
			}

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
						console.log('sending preview');

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

		socket.on('direct-message', async (to, text) => {
			const message = new DirectMessage(instance, to, user.id, text);

			console.log('new', to, text);

			await message.save();

			socket.emit('direct-message', await DirectMessage.get(instance, to, user.id, message.id));

			try {
				userSockets[to].emit('direct-message', await DirectMessage.get(instance, to, user.id, message.id));
			} catch(err) {
				// user offline
			}
		});

		socket.on('disconnect', async () => {
			users.splice(users.indexOf(socket), 1);
			delete userSockets[user.id];

			await user.goOffline();
		});
	});
});

server.listen(3000);
