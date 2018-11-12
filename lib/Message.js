const redis = require('./redis');

const User = require('./User');

module.exports = class Message {
	constructor(instance, channel, user, text) {
		this.instance = instance;
		this.channel = channel;
		this.user = user;
		this.text = text;
	}

	async save() {
		if(typeof this.id !== 'number') {
			this.id = await redis.incr(`${this.instance}:channel:${this.channel}:message-counter`);
		}

		await redis.multi()
			.set(`${this.instance}:channel:${this.channel}:message:${this.id}`, JSON.stringify(this))
			.lpush(`${this.instance}:channel:${this.channel}:messages`, this.id)
			.exec();
	}

	static async get(instance, channel, id) {
		const message = JSON.parse(await redis.get(`${instance}:channel:${channel}:message:${id}`));

		console.log(instance, channel, id, message);

		message.user = await User.get(instance, message.user);

		return message;
	}

	static async find(instance, channel) {
		const ids = await redis.lrange(`${instance}:channel:${channel}:messages`, 0, 100);

		console.log(instance, channel, ids);

		return Promise.all(ids.map(id => this.get(instance, channel, id)));
	}
};
