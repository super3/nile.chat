<template>
		<div class="flex items-start mb-4 text-sm">
			<img v-bind:src="message.user.avatar || `https://api.adorable.io/avatars/285/${message.user.name}.png`" class="w-10 h-10 rounded mr-3">

			<div class="w-full overflow-hidden">
				<div>
					<span class="font-bold">{{message.user.name}}</span>
					<span class="text-grey text-xs">{{message.date | relativeDate}}</span>
				</div>
				<p class="text-black leading-normal" style="white-space: pre;" v-html="text"></p>
			</div>

			<div class="w-full overflow-hidden" v-if="message.preview">
				<br>
				<img v-bind:src="message.preview.url" width="50%">
			</div>
		</div>
</template>

<script>
const relativeDate = require('relative-date');
const escape = require('../lib/escape');

module.exports = {
	props: [
		'message'
	],
	filters: {
		relativeDate
	},
	computed: {
		text() {
			const text = escape(this.message.text);

			/* https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url */

			function isValidURL(str) {
			   var a  = document.createElement('a');
			   a.href = str;
			   return (a.host && a.host != window.location.host);
			}

			return text.trim().split(' ').map(word => {
				if(word.startsWith('@')) {
					return `<strong>${word}</strong>`;
				}

				if(isValidURL(word)) {
					return `<a href="${word}" target="_blank">${word}</a>`;
				}

				return word;
			}).join(' ');
		}
	}
};
</script>
