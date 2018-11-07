const http = require('http');
const Koa = require('koa');
const Static = require('koa-static');
const Socket = require('socket.io');

const User = require('./lib/User');

const app = new Koa();

app.use(Static('public'));

const server = http.createServer(app.callback());

const io = new Socket(server);

io.on('connection', socket => {
	socket.on('init', async instance => {
		const user = new User(instance);

		await user.save();

		console.log(user);
		socket.emit('user', user);
	});
});

server.listen(3000);
