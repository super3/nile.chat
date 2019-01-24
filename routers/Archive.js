const Vue = require('vue');
const relativeDate = require('relative-date');

module.exports = Vue.component('archive', {
	template: `
	<div class="flex-1 flex flex-col bg-white overflow-hidden">
        <!-- Top bar -->
        <div class="border-b flex px-6 py-2 items-center flex-none">
            <div class="flex flex-col">
                <h3 class="text-grey-darkest mb-1 font-extrabold hidden md:block">#{{channel.name}}</h3>
								<div class="inline-block relative w-64 block md:hidden">

								  <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
								    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
								  </div>
								</div>
                <div class="text-grey-dark text-sm truncate hidden md:block">
                    Channel
                </div>
            </div>
        </div>
        <!-- Chat messages -->
        <div v-on:scroll="scroll" class="px-6 py-4 flex-1 overflow-y-scroll" ref="chat">
			<div v-for="message in channel.messages">
				<div class="flex items-start mb-4 text-sm">
					<img v-bind:src="(message.user || message.from).avatar" class="w-10 h-10 rounded mr-3">

					<div class="w-full overflow-hidden">
						<div>
							<span class="font-bold">{{(message.user || message.from).name}}</span>
							<span class="text-grey text-xs">{{message.date | relativeDate}}</span>
						</div>
						<p class="text-black leading-normal" v-html="sanitize(message.text)"></p>
					</div>

					<div class="w-full overflow-hidden" v-if="message.preview">
						<a v-bind:href="message.preview.url"><img v-bind:src="message.preview.url" target="_blank" width="50%"></a>
					</div>
				</div>
			</div>
        </div>

		<div class="pb-6 px-4 flex-none">
	<div class="flex rounded-lg border-2 border-grey overflow-hidden">
		<span class="text-3xl text-grey border-r-2 border-grey p-2">
			<svg class="fill-current h-6 w-6 block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z"/></svg>
		  </span>
		<input v-bind:placeholder="'Message #' + channel.name" v-model="message" v-on:keyup.13="handleMessage" type="text" class="w-full px-4" />
	</div>
</div>
    </div>
	`,
	props: [
		"channel"
	],
	filters: {
		relativeDate
	},
	methods: {
		sanitize(text) {
			text = text.replace(/\\/g, "\\\\")
				.replace(/\$/g, "\\$")
				.replace(/'/g, "\\'")
				.replace(/"/g, "\\\"")
				.replace(new RegExp('\n', 'g'), '<br>');

			function isValidURL(str) {/*
			   var a  = document.createElement('a');
			   a.href = str;
			   return (a.host && a.host != window.location.host);
			   */

			   return false;
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
});
