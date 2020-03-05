<template>
	<div class="font-sans antialiased h-screen flex">
		<!-- Sidebar / channel list -->
		<div class="bg-indigo-darkest text-purple-lighter flex-none p-4 hidden md:block">
			<div class="cursor-pointer mb-4" v-on:click="instance = state" v-for="state in instances">
				<div class="bg-indigo-lighter opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
					{{state.instance.slice(0, 1)}}
				</div>
				<div class="text-center text-white opacity-50 text-sm">&#8984; 1</div>
			</div>

			<div class="cursor-pointer">
				<div class="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
					<svg class="fill-current h-10 w-10 block" xmlns="http://www.w3.org/2000/svg" data-toggle="modal" data-target="#createChat" viewBox="0 0 20 20"><path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z"/></svg>
				</div>
			</div>
		</div>

		<Dash v-if="instance != 0" v-bind:state="instance"></Dash>
	</div>
</template>

<script>
const Socket = require('socket.io-client');
const Dash = require('./Dash.vue');

module.exports = {
	components: {
		Dash
	},
	data: () => ({
		instances: [],
		instance: 0
	}),
	created() {
		this.instances = [
			'nile.chat',
			'crypto.chat',
			'gitbackup.org'
		].map(instance => ({
			instance,
			socket: Socket(location.origin),
			user: {},
			users: [],
			channels: [],
			streams: [],
			directs: [],
			searchResults: []
		}));

		this.instances.forEach(instance => { (function() {
			this.socket.on('channel', channel => {
				this.channels.push(channel);

				if(this.selected === null) {
					this.selectedType = 'channel';
					this.selected = channel.id;
				}
			});

			this.socket.on('direct-messages', directs => {
				this.directs = directs;
			});

			this.socket.on('direct-message', message => {
				this.createDirect(message.from.id === this.user.id ? message.to.id : message.from.id);

				this.directs
				.find(direct => direct.user.id !== this.user.id && (direct.user.id === message.from.id || direct.user.id === message.to.id))
				.messages
				.push(message);

				if(message.from.id !== this.user.id) {
					const notification = new Notification('nile.chat', {
						body: `@${message.from.name} sent you a direct message`
					});

					notification.onclick = () => {
						this.selectDirect(message.from);
					};
				}
			});

			this.socket.on('message', (message, isNew) => {
				message.preview = null;

				this.channels
				.find(channel => channel.id === message.channel)
				.messages
				.push(message);

				if(isNew === true) {
					const needle = `@${this.user.name.toLowerCase()}`;

					if(message.text.toLowerCase().includes(needle) === true) {
						new Notification('nile.chat', {
							body: `@${message.user.name} mentioned you`
						});
					}
				}
			});

			this.socket.on('message-preview', (instance, channelId, messageId, preview) => {
				this.channels
				.find(channel => channel.id === channelId)
				.messages
				.find(message => message.id === messageId)
				.preview = preview;
			});

			this.socket.emit('init', this.instance, localStorage.getItem(`user-key:${this.instance}`));

			this.socket.on('user', user => {
				this.user = user;
			});

			this.socket.on('online', online => {
				this.users = online;
			});

			this.socket.on('streams', streams => {
				this.streams = streams;
			});

			this.socket.on('chunk', chunk => {
				this.streams
				.find(stream => stream.id == chunk.stream)
				.chunks.push(chunk);
			});

			this.socket.on('online-user', (user, status) => {
				if(status === true) {
					this.users.push(user);
				} else {
					this.users = this.users.filter(u => u.id !== user.id);
				}
			});

			this.socket.on('user-key', userKey => {
				localStorage.setItem(`user-key:${this.instance}`, userKey);
			});

			this.socket.on('search-results', results => {
				this.searchResults = results;
			});

			this.socket.on('disconnect', () => {
				setTimeout(() => location.reload(), 30 * 1000);
			});
		}).call(instance) });

		if(this.instances.length > 0)
		this.instance = this.instances[0];
	}
};
</script>
