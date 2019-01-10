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

const socketHandlers = [
	'channel': require('./socket/channel')
];

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

		for(const handler of socketHandlers) {
			handler({
				socket,
				instance,
				name,
				subscribe,
				user
			});
		}

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
