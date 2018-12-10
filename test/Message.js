const assert = require('assert');

const redis = require('../lib/redis');
const User = require('../lib/User');
const Message = require('../lib/Message');

describe('Message', () => {
	before(async () => {
		const keys = await redis.keys('test:*');

		if(keys.length >= 1)
			await redis.del(...keys);
	});

	let user, message, retrievedMessage;

	it('should generate a date', async () => {
		user = new User('test');
		await user.save();

		message = new Message('test', 0, user.id, 'hello, nile!');

		assert(typeof message.date === 'number');
	});

	it('should generate an id', async () => {
		await message.save();

		assert(typeof message.id === 'number');
	});

	it('should be retrievable after saving', async () => {
		retrievedMessage = await Message.get('test', 0, message.id);
		retrievedMessage.user = retrievedMessage.user.id;

		assert.deepEqual(retrievedMessage, message);
	});

	it('should be findable after saving', async () => {
		const retrievedMessages = await Message.find('test', 0);
		retrievedMessages[0].user = retrievedMessages[0].user.id;

		assert.deepEqual(retrievedMessages, [ message ]);
	});

	it('should be searchable', async () => {
		assert.deepEqual(await Message.search('test', 'he'), []);

		assert.deepEqual(await Message.search('test', 'hel'), [
			await Message.get('test', 0, message.id)
		]);

		assert.deepEqual(await Message.search('test', 'hello'), [
			await Message.get('test', 0, message.id)
		]);

		assert.deepEqual(await Message.search('test', 'hello, nil'), [
			await Message.get('test', 0, message.id)
		]);

		assert.deepEqual(await Message.search('test', 'hello nil'), []);
	});

	it('should save all arbitrary keys', async () => {
		message._arbitrary_key = 'hello!';
		await message.save();

		retrievedMessage = await Message.get('test', 0, message.id);

		assert.strictEqual(retrievedMessage._arbitrary_key, 'hello!');
	});

	it('should destroy, leaving no extraneous keys', async () => {
		await message.destroy();
		await user.destroy();

		assert.deepEqual(await redis.keys('test:*'), [ 'test:channel:0:message-counter' ]);
	});
});
