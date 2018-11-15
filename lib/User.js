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
		await redis.sadd(`${this.instance}:online`, this.id);
	}

	async goOffline() {
		await redis.srem(`${this.instance}:online`, this.id);
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
