<template>
		<div class="flex items-start mb-4 text-sm">
			<img v-bind:src="(message.user || message.from).avatar || `https://api.adorable.io/avatars/285/${(message.user || message.from).id}.png`" class="w-10 h-10 rounded mr-3">

			<div class="w-full overflow-hidden">
				<div>
					<span class="font-bold">{{(message.user || message.from).name}}</span>
					<span class="text-grey text-xs">{{message.date | relativeDate}}</span>
				</div>
				<p class="text-black leading-normal" v-html="text"></p>
			</div>

			<div class="w-full overflow-hidden" v-if="message.preview">
				<a v-bind:href="message.preview.url"><img v-bind:src="message.preview.url" target="_blank" width="50%"></a>
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
	data: () => ({
		interval: null
	}),
	created() {
		this.interval = setInterval(() => this.$forceUpdate(), 5000);
	},
	beforeDestroy() {
		clearInterval(this.interval);
	},
	filters: {
		relativeDate
	},
	computed: {
		text() {
			const text = escape(this.message.text)
				.replace(new RegExp('\n', 'g'), '<br>');

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
