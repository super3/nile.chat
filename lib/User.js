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

	static async get(instance, id) {
		const user = new User;

		Object.assign(user, JSON.parse(await redis.get(`${instance}:user:${id}`)));

		return user;
	}
}

module.exports = User;
