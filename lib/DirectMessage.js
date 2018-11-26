const redis = require('./redis');

const User = require('./User');

const channel = (to, from) => `${Math.min(to, from)}-${Math.max(to, from)}`;

module.exports = class DirectMessage {
	constructor(instance, to, from, text) {
		this.instance = instance;
		this.to = to;
		this.from = from;
		this.text = text;
		this.date = Date.now();
	}

	get channel() {
		return channel(this.to, this.from);
	}

	async save() {
		if(typeof this.id === 'undefined') {
			this.id = await redis.incr(`${this.instance}:direct:${this.channel}:message-counter`);
		}

		console.log('save', this);

		await redis.multi()
			.set(`${this.instance}:direct:${this.channel}:message:${this.id}`, JSON.stringify(this))
			.lrem(`${this.instance}:direct:${this.channel}:messages`, 0, this.id)
			.lpush(`${this.instance}:direct:${this.channel}:messages`, this.id)
			.lrem(`${this.instance}:directs:${this.to}`, 0, this.from)
			.lpush(`${this.instance}:directs:${this.to}`, this.from)
			.lrem(`${this.instance}:directs:${this.from}`, 0, this.to)
			.lpush(`${this.instance}:directs:${this.from}`, this.to)
			.publish(`${this.instance}:direct-message:${this.to}`, JSON.stringify([ this.to, this.from, this.id ]))
			.publish(`${this.instance}:direct-message:${this.from}`, JSON.stringify([ this.to, this.from, this.id ]))
			.exec();
	}

	static async get(instance, userA, userB, id) {
		const message = JSON.parse(await redis.get(`${instance}:direct:${channel(userA, userB)}:message:${id}`));

		console.log('get', arguments, message);

		message.to = await User.get(instance, message.to);
		message.from = await User.get(instance, message.from);

		return message;
	}

	static async find(instance, userA, userB) {
		const ids = await redis.lrange(`${instance}:direct:${channel(userA, userB)}:messages`, 0, -1);

		ids.reverse();

		return Promise.all(ids.map(id => this.get(instance, userA, userB, id)));
	}

	static async findDirects(instance, id, loadConversations = true) {
		const users = await redis.lrange(`${instance}:directs:${id}`, 0, -1);

		if(!loadConversations)
			return users;

		return Promise.all(users.map(async user => ({
			user: await User.get(instance, user),
			messages: await this.find(instance, id, user)
		})));
	}
};
