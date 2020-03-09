const redis = require('./redis');

const search = require('./search');

module.exports = class Chunk {
	constructor(instance, stream, type, source, content) {
		Object.assign(this, {
			instance,
			stream,
			type,
			source,
			content
		});

		this.date = Date.now();
	}

	async save() {
		if(typeof this.id === 'undefined') {
			this.id = await redis.incr(`${this.instance}:stream:${this.stream}:chunk-counter`);
		}

		const tx = redis.multi()
			.sadd(`${this.instance}:streams`, this.stream)
			.set(`${this.instance}:stream:${this.stream}:chunk:${this.id}`, JSON.stringify(this))
			.lrem(`${this.instance}:stream:${this.stream}:chunks`, 0, this.id)
			.lpush(`${this.instance}:stream:${this.stream}:chunks`, this.id)
			.publish(`${this.instance}:chunk`, JSON.stringify([ this.stream, this.id ]));

		await tx.exec();
	}

	static async get(instance, stream, id) {
		return JSON.parse(await redis.get(`${instance}:stream:${stream}:chunk:${id}`));
	}

	static async getStream(instance, stream, history = 100) {
		const ids = await redis.lrange(`${instance}:stream:${stream}:chunks`, 0, -1);

		ids.reverse();

		return {
			id: stream,
			chunks: await Promise.all(ids.sort().reverse().slice(0, 25).map(id => this.get(instance, stream, id)))
		};
	}

	static async getStreams(instance) {
		const streams = await redis.smembers(`${instance}:streams`);

		return Promise.all(streams.map(stream => this.getStream(instance, stream)));
	}
};
