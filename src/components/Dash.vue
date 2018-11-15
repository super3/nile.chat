<template>
	<div>

		<div class="font-sans antialiased h-screen flex">
    <!-- Sidebar / channel list -->
    <div class="bg-indigo-darkest text-purple-lighter flex-none p-4 hidden md:block">
        <div class="cursor-pointer mb-4">
            <div class="bg-indigo-lighter opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                N
            </div>
            <div class="text-center text-white opacity-50 text-sm">&#8984; 1</div>
        </div>
        <div class="cursor-pointer">
            <div class="bg-white opacity-25 h-12 w-12 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
                <svg class="fill-current h-10 w-10 block" xmlns="http://www.w3.org/2000/svg" data-toggle="modal" data-target="#createChat" viewBox="0 0 20 20"><path d="M16 10c0 .553-.048 1-.601 1H11v4.399c0 .552-.447.601-1 .601-.553 0-1-.049-1-.601V11H4.601C4.049 11 4 10.553 4 10c0-.553.049-1 .601-1H9V4.601C9 4.048 9.447 4 10 4c.553 0 1 .048 1 .601V9h4.399c.553 0 .601.447.601 1z"/></svg>
            </div>
        </div>
    </div>
    <div class="bg-indigo-darker text-purple-lighter flex-none w-64 pb-6 hidden md:block">
        <div class="text-white mb-2 mt-3 px-4 flex justify-between">
            <div class="flex-auto">
                <h1 class="font-semibold text-xl leading-tight mb-1 truncate">{{ instance === 'big.chat' ? 'nile.chat' : instance }}</h1>
                <div class="flex items-center mb-6">
                    <svg class="h-2 w-2 fill-current text-green mr-2" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"></circle></svg>
                    <span class="text-white opacity-50 text-sm">{{user.name}}</span>
                </div>
            </div>
            <div>
						<!-- Button trigger modal -->
								<svg
									 width="20"
									 height="20"
									 viewBox="0 0 24 24"
									 fill="none"
									 stroke="currentColor"
									 stroke-width="2"
									 stroke-linecap="round"
									 stroke-linejoin="round"
									 class="feather feather-settings opacity-25"
									 data-toggle="modal" data-target="#exampleModalCenter"
									 >
									 <path
											style=""
											d="m 15,12 a 3,3 0 0 1 -3,3 3,3 0 0 1 -3,-3 3,3 0 0 1 3,-3 3,3 0 0 1 3,3 z"
											id="circle3725" />
									 <path
											d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
											id="path3727" />
								</svg>
            </div>
        </div>
        <div class="mb-8">
            <div class="px-4 mb-2 text-white flex justify-between items-center">
                <div class="opacity-75">Channels</div>
                <div>
                    <svg v-on:click="newChannel = ''" class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                    </svg>
                </div>
            </div>

            <div v-for="channel in channels" v-on:click="selectedChannel = channel.id" v-bind:class="{ 'bg-teal-dark': selectedChannel === channel.id }" class="py-1 px-4 text-white"># {{channel.name}}</div>

			<div v-if="typeof newChannel === 'string'" class="bg-teal-dark py-1 px-4 text-white"># <input v-model="newChannel" v-on:keyup.13="createChannel" type="text"></div>
        </div>
        <div class="mb-8">
            <!--<div class="px-4 mb-2 text-white flex justify-between items-center">
                <div class="opacity-75">Direct Messages</div>
                <div>
                    <svg class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                    </svg>
                </div>
            </div>-->
            <div v-for="user in users" class="flex items-center mb-3 px-4">
                <svg class="h-2 w-2 fill-current text-green mr-2" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"></circle></svg>
                <span class="text-white opacity-75">{{user.name}}</span>
            </div>
        </div>
        <!--<div>
            <div class="px-4 mb-2 text-white flex justify-between items-center">
                <div class="opacity-75">Apps</div>
                <div>
                    <svg class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                    </svg>
                </div>

            </div>
        </div>-->
				<div class="flex px-3">
						<button class="flex-grow hover:bg-white hover:text-black text-grey-lightest py-2 px-2 m-10 border rounded" data-toggle="modal" data-target="#inviteModal">
						  Invite
						</button>
				</div>
    </div>
    <!-- Chat content -->
	<Channel v-if="selectedChannel !== undefined" v-bind:channel="channels.find(channel => channel.id === selectedChannel)" v-on:message="createMessage"></Channel>
</div>

	</div>
</template>

<script>
const socket = require('socket.io-client')(location.origin);
const Channel = require('./Channel.vue');

module.exports = {
	data: () => ({
		user: {},
		users: [],
		newChannel: false,
		selectedChannel: undefined,
		channels: [],
		instance: location.search.slice(1) || 'big.chat'
	}),
	methods: {
		createChannel() {
			socket.emit('channel', this.newChannel);
			this.newChannel = false;
		},
		createMessage(text) {
			socket.emit('message', this.selectedChannel, text);
		}
	},
	created() {
		Notification.requestPermission();

		socket.on('channel', channel => {
			this.channels.push(channel);

			if(this.selectedChannel === undefined)
				this.selectedChannel = channel.id;
		});

		socket.on('message', (message, isNew) => {
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

		socket.on('message-preview', (instance, channelId, messageId, preview) => {
			this.channels
				.find(channel => channel.id === channelId)
				.messages
					.find(message => message.id === messageId)
					.preview = preview;
		});

		socket.emit('init', this.instance, localStorage.getItem(`user-key:${this.instance}`));

		socket.on('user', user => {
			console.log(user);
			this.user = user;
		});

		socket.on('online', online => {
			this.users = online;
		});

		socket.on('user-key', userKey => {
			localStorage.setItem(`user-key:${this.instance}`, userKey);
		});
	},
	components: {
		Channel
	}
};
</script>
