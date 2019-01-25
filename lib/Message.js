const redis = require('./redis');

const search = require('./search');
const User = require('./User');

module.exports = class Message {
	constructor(instance, channel, user, text) {
		this.instance = instance;
		this.channel = channel;
		this.user = user;
		this.text = text;
		this.date = Date.now();
	}

	async save() {
		if(typeof this.id === 'undefined') {
			this.id = await redis.incr(`${this.instance}:channel:${this.channel}:message-counter`);
		}

		const tx = redis.multi()
			.set(`${this.instance}:channel:${this.channel}:message:${this.id}`, JSON.stringify(this))
			.lrem(`${this.instance}:channel:${this.channel}:messages`, 0, this.id)
			.lpush(`${this.instance}:channel:${this.channel}:messages`, this.id)
			.publish(`${this.instance}:message`, JSON.stringify([ this.channel, this.id ]));

		for(const chunk of search.chunkify(this.text)) {
			tx.sadd(`${this.instance}:messages-search:${chunk}`, JSON.stringify([ this.channel, this.id ]));
		}

		await tx.exec();
	}

	async destroy() {
		const tx = redis.multi()
			.del(`${this.instance}:channel:${this.channel}:message:${this.id}`)
			.lrem(`${this.instance}:channel:${this.channel}:messages`, 0, this.id);

		for(const chunk of search.chunkify(this.text)) {
			tx.srem(`${this.instance}:messages-search:${chunk}`, JSON.stringify([ this.channel, this.id ]));
		}

		await tx.exec();
	}

	static async get(instance, channel, id) {
		const message = JSON.parse(await redis.get(`${instance}:channel:${channel}:message:${id}`));

		message.user = await User.get(instance, message.user);

		return message;
	}

	static async getLast(instance, channel) {
		return this.get(instance, channel, await redis.lindex(`${instance}:channel:${channel}:messages`, 0));
	}

	static async find(instance, channel, messages = 100) {
		const ids = await redis.lrange(`${instance}:channel:${channel}:messages`, 0, messages);

		ids.reverse();

		return Promise.all(ids.map(id => this.get(instance, channel, id)));
	}

	static async search(instance, query, results = 10) {
		const sets = search.chunkify(query).map(chunk => `${instance}:messages-search:${chunk}`);

		if(sets.length < 1) {
			return [];
		}

		const ids = sets.length <= 1 ? await redis.smembers(...sets) : await redis.sinter(...sets);

		return Promise.all(ids.slice(0, results).map(async json => {
			const [ channelId, id ] = JSON.parse(json);

			const message = await this.get(instance, channelId, id);

			return message;
		}));
	}
};
