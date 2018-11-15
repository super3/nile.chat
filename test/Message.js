const assert = require('assert');

const Message = require('../lib/Message');

describe('Message', () => {
	it('should generate an ID', async () => {
		const message = new Message('test', 0, 0, 'test');

		await message.save();

		assert(typeof message.id === 'number');
	});
});
