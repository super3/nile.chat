const assert = require('assert');

const redis = require('../lib/redis');
const Channel = require('../lib/Channel');

describe('Channel', () => {
	before(async () => {
		const keys = await redis.keys('test:*');

		if(keys.length >= 1)
			await redis.del(...keys);
	});

	let channel;

	it('should be retrievable after saving', async () => {
		channel = new Channel('test', 'general');

		await channel.save();

		const retrievedChannel = await Channel.get('test', channel.id);
		delete retrievedChannel.messages;

		assert.deepEqual(channel, retrievedChannel);
	});

	it('should be findable', async () => {
		const retrievedChannels = await Channel.find('test');
		delete retrievedChannels[0].messages;

		assert.deepEqual(retrievedChannels, [ channel ]);
	});
});
