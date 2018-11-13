module.exports = input => {
	const decoder = document.createElement('div');

	decoder.innerHTML = input;
	return decoder.textContent;
};

console.log(module.exports("yooo<h1>dsfsd"))
