const crypto = require('crypto');
const http = require('http');
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
				user.name = text.split(' ')[1] || user.name;
				await user.save();

				socket.emit('user', user);
			}

			if(text.startsWith('/avatar')) {
				user.avatar = text.split(' ')[1] || undefined;
				await user.save();
			}

			const message = new Message(instance, channelId, user.id, text);
			await message.save();

			for(const user of users) {
				user.emit('message', await Message.get(instance, channelId, message.id));
			}
		});
	});
});

server.listen(3000);
