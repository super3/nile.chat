const redis = require('./redis');

const Message = require('./Message');

module.exports = class Channel {
	constructor(instance, name) {
		this.instance = instance;
		this.name = name;
	}

	async save() {
		if(typeof this.id === 'undefined') {
			this.id = await redis.incr(`${this.instance}:channel-counter`);
		}

		await redis.multi()
			.set(`${this.instance}:channel:${this.id}`, JSON.stringify(this))
			.sadd(`${this.instance}:channels`, this.id)
			.publish(`${this.instance}:channel`, JSON.stringify([ this.id ]))
			.exec();
	}

	async destroy() {
		await redis.multi()
			.del(`${this.instance}:channel:${this.id}`)
			.srem(`${this.instance}:channels`, this.id)
			.del('test:channel:0:message-counter')
			.exec();
	}

	static async get(instance, id) {
		const channel = JSON.parse(await redis.get(`${instance}:channel:${id}`));

		channel.messages = await Message.find(instance, id);

		return channel;
	}

	static async findIds(instance) {
		return await redis.smembers(`${instance}:channels`);
	}

	static async find(instance) {
		const ids = await this.findIds(instance);

		return Promise.all(ids.map(id => this.get(instance, id)));
	}
};
