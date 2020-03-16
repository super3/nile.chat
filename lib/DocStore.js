const fs = require('fs').promises;
const {read} = require('fs');
const debug = require('debug')('docstore');

module.exports = {
	async push(filename, document) {
		await fs.appendFile(filename, `${JSON.stringify(document)}\n`);
	},

	async tail(filename, bufferSize = 2000) {
		const {size} = await fs.stat(filename);

		const position = Math.max(0, size - bufferSize);
		const buffer = Buffer.alloc(bufferSize);

		debug({ filename, size, position, buffer });

		const f = await fs.open(filename, 'r');
		const {bytesRead} = await f.read(buffer, 0, bufferSize, position);
		await f.close();

		return buffer
			.slice(0, bytesRead)
			.toString()
			.split('\n')
			.slice(position === 0 ? 0 : 1, -1)
			.map(doc => JSON.parse(doc));
	}
};
