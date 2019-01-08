const crypto = require('crypto');
const http = require('http');
const url = require('url');
const fs = require('mz/fs');
const axios = require('axios');
const Koa = require('koa');
const koaStatic = require('koa-static');
const Router = require('koa-router');
const Socket = require('socket.io');
const Redis = require('ioredis');

const redis = require('./lib/redis');

const User = require('./lib/User');
const Channel = require('./lib/Channel');
const Message = require('./lib/Message');
const DirectMessage = require('./lib/DirectMessage');
const Chunk = require('./lib/Chunk');

const app = new Koa();

const router = new Router();

router.get('/streams/:instance/:stream/push', async ctx => {
	const chunk = new Chunk(ctx.params.instance, ctx.params.stream, ctx.params.type || "text", ctx.params.source || "api", ctx.query.content);

	await chunk.save();

	ctx.body = "";
});

app.use(router.routes())
app.use(router.allowedMethods());

app.use(koaStatic('public'));

const server = http.createServer(app.callback());

const io = new Socket(server);

io.on('connection', socket => {
	// eslint-disable-next-line no-use-before-define
	socket.on('init', async (instance, userKey) => {
		const sub = new Redis(process.env.REDIS_URL);

		const subscribe = async (channel, handler) => {
			await sub.subscribe(channel);

			sub.on('message', (messageChannel, message) => {
				if(messageChannel === String(channel)) {
					handler(...JSON.parse(message));
				}
			});
		};

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

		socket.emit('user', user);
		socket.emit('online', await User.findOnline(instance));
		socket.emit('direct-messages', await DirectMessage.findDirects(instance, user.id));
		socket.emit('online', await User.findOnline(instance));
		socket.emit('streams', await Chunk.getStreams(instance));

		subscribe(`${instance}:chunk`, async (stream, id) => {
			socket.emit('chunk', await Chunk.get(instance, stream, id));
		});

		await user.goOnline();

		subscribe(`${instance}:online`, async (id, status) => {
			socket.emit('online-user', await User.get(instance, id), status);
		});

		for(const channel of await Channel.find(instance)) {
			socket.emit('channel', channel);
		}

		socket.on('channel', async name => {
			const channel = new Channel(instance, name);
			await channel.save();
		});

		subscribe(`${instance}:channel`, async id => {
			socket.emit('channel', await Channel.get(instance, id));
		});

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

		socket.on('direct-message', async (to, text) => {
			const message = new DirectMessage(instance, to, user.id, text);
			await message.save();
		});

		subscribe(`${instance}:direct-message:${user.id}`, async (to, from, id) => {
			socket.emit('direct-message', await DirectMessage.get(instance, to, from, id));
		});

		socket.on('search-query', async query => {
			const results = await Message.search(instance, query);
			console.log(results, query);

			socket.emit('search-results', results);
		});

		socket.on('disconnect', async () => {
			await user.goOffline();
		});
	});
});

server.listen(process.env.PORT || 3000);
