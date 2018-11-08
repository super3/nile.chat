const redis = require('./redis');

const Message = require('./Message');

module.exports = class Channel {
	constructor(instance, name) {
		this.instance = instance;
		this.name = name;
	}

	async save() {
		if(typeof this.id !== 'number') {
			this.id = await redis.incr(`${this.instance}:channel-counter`);
		}

		await redis.set(`${this.instance}:channel:${this.id}`, JSON.stringify(this));
		await redis.sadd(`${this.instance}:channels`, this.id);
	}

	static async get(instance, id) {
		const channel = JSON.parse(await redis.get(`${instance}:channel:${id}`));

		channel.messages = await Message.find(instance, id);

		return channel;
	}

	static async find(instance) {
		const ids = await redis.smembers(`${instance}:channels`);

		return Promise.all(ids.map(id => this.get(instance, id)));
	}
};
