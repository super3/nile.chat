<template>
	<div class="flex-1 flex flex-col bg-white overflow-hidden">
        <!-- Top bar -->
        <div class="border-b flex px-6 py-2 items-center flex-none">
            <div class="flex flex-col">
                <h3 class="text-grey-darkest mb-1 font-extrabold hidden md:block">#{{channel.name}}</h3>
								<div class="inline-block relative w-64 block md:hidden">
								  <select v-model="selected" v-on:change="updateSelected" class="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded leading-tight focus:outline-none">
						 			  <option class="font-bold text-black" disabled>Channels</option>
										<option v-for="channel in channels" v-bind:value="JSON.stringify([ 'channel', channel.id ])"><span style="margin-left: 50px;">&nbsp;&nbsp;&nbsp;#{{channel.name}}</span></option>
										<option class="font-bold text-black" disabled>Direct Messages</option>
										<option class="pr-5 mr-5" v-for="direct in directs" v-bind:value="JSON.stringify([ 'direct', direct.user.id ])">&nbsp;&nbsp;&nbsp;{{direct.user.name}}</option>
								  </select>
								  <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
								    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
								  </div>
								</div>
                <div class="text-grey-dark text-sm truncate hidden md:block">
                    Channel
                </div>
            </div>
            <div class="ml-auto hidden md:block">
                <div class="relative">
                    <input v-model="searchQuery" v-on:keyup="$emit('search', searchQuery)" type="search" placeholder="Search" class="appearance-none border border-grey rounded-lg pl-8 pr-4 py-2">

                    <div class="absolute pin-y pin-l pl-3 flex items-center justify-center">
                        <svg class="fill-current text-grey h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                        </svg>
                    </div>

					<div v-if="searchResults.length > 0" style="position: absolute; z-index: 1000;" class="bg-white shadow  pl-8 pr-4 py-2">
						<div v-for="message in searchResults">
							<div class="flex items-start mb-4 text-sm">
								<img v-bind:src="(message.user || message.from).avatar || `https://api.adorable.io/avatars/285/${(message.user || message.from).id}.png`" class="w-10 h-10 rounded mr-3">

								<div class="w-full overflow-hidden">
									<div>
										<span class="font-bold">{{(message.user || message.from).name}} in #{{channels.find(channel => channel.id === message.channel).name}}</span>
										<span class="text-grey text-xs">{{message.date | relativeDate}}</span>
									</div>
									<p class="text-black leading-normal">{{message.text}}</p>
								</div>

								<div class="w-full overflow-hidden" v-if="message.preview">
									<a v-bind:href="message.preview.url"><img v-bind:src="message.preview.url" target="_blank" width="50%"></a>
								</div>
							</div>
						</div>
					</div>
                </div>
            </div>
        </div>
        <!-- Chat messages -->
        <div v-on:scroll="scroll" class="px-6 py-4 flex-1 overflow-y-scroll" ref="chat">
			<div v-for="message in channel.messages">
				<Message v-bind:message="message"></Message>
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
</template>

<script>
const Message = require('./Message.vue');
const relativeDate = require('relative-date');

module.exports = {
	props: [
		"channel",
		"channels",
		"directs",
		"searchResults"
	],
	data: () => ({
		message: "",
		docked: true,
		selected: null,
		searchQuery: ''
	}),
	created() {
		this.selected = JSON.stringify([ 'channel', this.channel.id ]);
	},
	methods: {
		handleMessage() {
			this.$emit('message', this.message);
			this.message = "";
			this.docked = true;
		},
		scroll() {
			this.docked = this.$refs.chat.scrollTop === (this.$refs.chat.scrollHeight - this.$refs.chat.offsetHeight);

			if(this.docked === true) {
				this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
			}
		},
		updateSelected() {
			this.$emit('selected', ...JSON.parse(this.selected));
		}
	},
	filters: {
		relativeDate
	},
	mounted() {
		this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight - this.$refs.chat.offsetHeight;
	},
	updated() {
		if(this.docked === true) {
			this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
		}
	},
	components: {
		Message
	}
};
</script>
