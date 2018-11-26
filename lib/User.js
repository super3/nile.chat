const dogNames = require('dog-names');
const redis = require('./redis');

class User {
	constructor(instance) {
		this.instance = instance;

		this.name = dogNames.allRandom();
	}

	async save() {
		if(typeof this.id === 'undefined') {
			this.id = await redis.incr('user-counter');
		}

		await redis.set(`${this.instance}:user:${this.id}`, JSON.stringify(this));
	}

	async goOnline() {
		await redis.multi()
			.sadd(`${this.instance}:online`, this.id)
			.publish(`${this.instance}:online`, JSON.stringify([ this.id, true ]))
			.exec();
	}

	async goOffline() {
		await redis.multi()
			.srem(`${this.instance}:online`, this.id)
			.publish(`${this.instance}:online`, JSON.stringify([ this.id, false ]))
			.exec();
	}

	static async get(instance, id) {
		const user = new User();

		Object.assign(user, JSON.parse(await redis.get(`${instance}:user:${id}`)));

		return user;
	}

	static async findOnline(instance) {
		const ids = await redis.smembers(`${instance}:online`);

		return Promise.all(ids.map(id => User.get(instance, id)));
	}
}

module.exports = User;
