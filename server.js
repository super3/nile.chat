const http = require('http');
const Koa = require('koa');
const Static = require('koa-static');
const Socket = require('socket.io');

const User = require('./lib/User');
const Channel = require('./lib/Channel');
const Message = require('./lib/Message');

const app = new Koa();

app.use(Static('public'));

const server = http.createServer(app.callback());

const io = new Socket(server);

const users = [];

io.on('connection', socket => {
	socket.on('init', async instance => {
		users.push(socket);

		const user = new User(instance);
		await user.save();

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
