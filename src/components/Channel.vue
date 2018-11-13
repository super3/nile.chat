<template>
	<div class="flex-1 flex flex-col bg-white overflow-hidden">
        <!-- Top bar -->
        <div class="border-b flex px-6 py-2 items-center flex-none">
            <div class="flex flex-col">
                <h3 class="text-grey-darkest mb-1 font-extrabold">#{{channel.name}}</h3>
                <div class="text-grey-dark text-sm truncate">
                    {{channel.description}}
                </div>
            </div>
            <div class="ml-auto hidden md:block">
                <div class="relative">
                    <input type="search" placeholder="Search" class="appearance-none border border-grey rounded-lg pl-8 pr-4 py-2">
                    <div class="absolute pin-y pin-l pl-3 flex items-center justify-center">
                        <svg class="fill-current text-grey h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <!-- Chat messages -->
        <div class="px-6 py-4 flex-1 overflow-y-scroll" ref="chat">
            <div v-for="message in channel.messages" class="flex items-start mb-4 text-sm">
                <img v-bind:src="message.user.avatar || `https://api.adorable.io/avatars/285/${message.user.name}.png`" class="w-10 h-10 rounded mr-3">

                <div class="flex-1 overflow-hidden">
                    <div>
                        <span class="font-bold">{{message.user.name}}</span>
                        <span class="text-grey text-xs">{{message.date | relativeDate}}</span>
                    </div>
                    <p class="text-black leading-normal">{{message.text}}</p>
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
</template>

<script>
const relativeDate = require('relative-date');

module.exports = {
	props: [
		"channel"
	],
	data: () => ({
		message: "",
		scrollNeeded: false,
		interval: undefined
	}),
	watch: {
		"channel.messages": function() {
			this.scrollNeeded = true;
		}
	},
	methods: {
		handleMessage() {
			this.$emit('message', this.message);
			this.message = "";
		}
	},
	filters: {
		relativeDate
	},
	created() {
		this.interval = setInterval(() => this.$forceUpdate(), 5000);
	},
	mounted() {
		this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
	},
	updated() {
		if(this.scrollNeeded === true) {
			this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
			this.scrollNeeded = false;
		}
	},
	beforeDestroy() {
		clearInterval(this.interval);
	}
};
</script>
