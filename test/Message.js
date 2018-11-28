const assert = require('assert');

const redis = require('../lib/redis');
const Message = require('../lib/Message');

describe('Message', () => {
	beforeEach(async () => {
		const keys = await redis.keys('test:*');

		if(keys.length >= 1)
			await redis.del(...keys);
	});

	it('should generate a date', async () => {
		const message = new Message('test', 0, 0, 'test');

		assert(typeof message.date === 'number');
	});

	it('should generate an ID', async () => {
		const message = new Message('test', 0, 0, 'test');

		await message.save();

		assert(typeof message.id === 'number');
	});
});
