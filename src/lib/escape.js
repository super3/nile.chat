module.exports = input => {
	const decoder = document.createElement('div');

	decoder.innerHTML = input;
	return decoder.textContent;
};
