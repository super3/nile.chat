const assert = require('assert');

const redis = require('../lib/redis');
const User = require('../lib/User');

describe('User', () => {
	before(async () => {
		const keys = await redis.keys('test:*');

		if(keys.length >= 1)
			await redis.del(...keys);
	});

	let user, retrievedUser;

	it('should give a name by default', () => {
		user = new User('test');

		assert.strictEqual(typeof user.name, 'string');
	});

	it('should be retrievable after saving', async () => {
		await user.save();

		retrievedUser = await User.get('test', user.id);

		assert.strictEqual(typeof retrievedUser, 'object');
	});

	it('should save all arbitrary keys', async () => {
		user._arbitrary_key = 'hello!';
		await user.save();

		retrievedUser = await User.get('test', user.id);

		assert.strictEqual(retrievedUser._arbitrary_key, 'hello!');
	});

	it('should go online', async () => {
		await user.goOnline();

		assert.deepEqual(await User.findOnline('test'), [ user ]);
	});

	it('should go offline', async () => {
		await user.goOffline();

		assert.deepEqual(await User.findOnline('test'), []);
	});

	it('should destroy, leaving no extraneous keys', async () => {
		await user.destroy();

		assert.deepEqual(await redis.keys('test:*'), []);
	});
});
