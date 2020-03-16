const fs = require('fs');
const assert = require('assert');
const DocStore = require('../lib/DocStore');

describe('DocStore', () => {
	const logFile = '/tmp/test.log';

	before(async () => {
		try {
			await fs.promises.unlink(logFile)
		} catch(err) {

		}
	});

	const data = [
		{ name: 'Sam' },
		{ name: 'Lily '},
		{ name: 'John '}
	];

	it('should push data', async () => {
		for(const doc of data) {
			await DocStore.push(logFile, doc);
		}
	});

	it('should tail data', async () => {
		const docs = await DocStore.tail(logFile);

		assert.deepEqual(data, docs);
	});
});
