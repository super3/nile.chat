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
			.set(`${this.instance}:stream:${this.stream}:chunk:${this.id}`, JSON.stringify(this))
			.lrem(`${this.instance}:stream:${this.stream}:chunks`, 0, this.id)
			.lpush(`${this.instance}:stream:${this.stream}:chunks`, this.id)
			.publish(`${this.instance}:chunk`, JSON.stringify([ this.stream, this.id ]));

		await tx.exec();
	}
};
