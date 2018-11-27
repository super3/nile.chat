module.exports = {
	chunkify(text) {
		const chunks = [];

		for(let i = 0; i < text.length - 3; i++) {
			chunks.push(text.slice(i, i + 3));
		}

		console.log(chunks);

		return chunks;
	}
};
