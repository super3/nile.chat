const redis = require('./redis');
const docStore = require('./DocStore');
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
		const tx = redis.multi()
			.sadd(`${this.instance}:streams`, this.stream)
			.publish(`${this.instance}:chunk`, JSON.stringify([ this.stream, {...this} ]));

		const streamFile = `${__dirname}/../data/${Buffer.from(this.instance).toString('hex')}-${Buffer.from(this.stream).toString('hex')}.stream`;

		await docStore.push(streamFile, { ...this });

		await tx.exec();
	}

	static async getStream(instance, stream, history = 50) {
		const streamFile = `${__dirname}/../data/${Buffer.from(instance).toString('hex')}-${Buffer.from(stream).toString('hex')}.stream`;

		return {
			id: stream,
			chunks: await docStore.tail(streamFile)
		};
	}

	static async getStreams(instance) {
		const streams = await redis.smembers(`${instance}:streams`);

		return Promise.all(streams.map(stream => this.getStream(instance, stream)));
	}
};
