<template>
	<div class="flex-1 flex">

	    <div class="bg-indigo-darker text-purple-lighter w-1/5 h-full">
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

	            <div v-for="channel in channels" v-on:click="selectChannel(channel)" v-bind:class="{ 'bg-teal-dark': selectedType === 'channel' && selected === channel.id }" class="py-1 px-4 text-white"># {{channel.name}}</div>

				<div v-if="typeof newChannel === 'string'" class="bg-teal-dark py-1 px-4 text-white"># <input v-model="newChannel" v-on:keyup.13="createChannel" type="text"></div>
	        </div>

			<div class="sm-8">
				<div class="px-4 mb-2 text-white flex justify-between items-center">
					<div class="opacity-75">Streams</div>

				</div>

					<div
						v-for="stream in streams"
						v-on:click="selectStream(stream)"
						v-bind:class="{ 'bg-teal-dark': selectedType === 'stream' && selected === stream.id }"

						class="flex items-center py-1 px-4"
					>
		                <svg
							class="h-2 w-2 fill-current text-green mr-2"
							v-bind:class="{ 'text-white': selectedType === 'stream' && selected === stream.id }"
							viewBox="0 0 20 20"
						>
							<circle cx="10" cy="10" r="10"></circle>
						</svg>

		                <span class="text-white opacity-75">{{stream.id}}</span>
				</div>
			</div>

	        <div class="mb-8">
	            <div class="px-4 mb-2 text-white flex justify-between items-center">
	                <div class="opacity-75">Direct Messages</div>
	                <div>
	                    <svg class="fill-current h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
	                        <path d="M11 9h4v2h-4v4H9v-4H5V9h4V5h2v4zm-1 11a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
	                    </svg>
	                </div>
	            </div>

	            <div v-for="directUser in users" v-if="directUser.id !== user.id" v-on:click="selectDirect(directUser)" v-bind:class="{ 'bg-teal-dark': selectedType === 'direct' && selected === directUser.id }" class="flex items-center py-1 px-4">
	                <svg class="h-2 w-2 fill-current text-green mr-2" v-bind:class="{ 'text-white': selectedType === 'direct' && selected === directUser.id }" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"></circle></svg>
	                <span class="text-white opacity-75">{{directUser.name}}</span>
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

		<div class="w-4/5 h-full">
			<Channel v-if="selectedType === 'channel'"
				v-bind:channel="channels.find(channel => channel.id === selected)"
				v-bind:channels="channels"
				v-bind:directs="directs"
				v-bind:searchResults="searchResults"
				v-on:message="createMessage"
				v-on:selected="handleSelected"
				v-on:search="search"
			></Channel>

			<Direct v-if="selectedType === 'direct'"
				v-bind:direct="directs.find(direct => direct.user.id === selected)"
				v-bind:channels="channels"
				v-bind:directs="directs"
				v-bind:searchResults="searchResults"
				v-on:message="createDirectMessage"
				v-on:selected="handleSelected"
				v-on:search="search"
			></Direct>

			<Stream v-if="selectedType === 'stream'"
				v-bind:stream="streams.find(stream => stream.id === selected)"
			></Stream>
		</div>
	</div>
</template>

<script>
const Channel = require('./Channel.vue');
const Direct = require('./Direct.vue');
const Stream = require('./Stream.vue');

module.exports = {
	props: [
		'state'
	],
	computed: {
		instance() {
			return this.state.instance;
		},
		socket() {
			return this.state.socket;
		},
		user() {
			return this.state.user;
		},
		users() {
			return this.state.users;
		},
		channels() {
			return this.state.channels;
		},
		streams() {
			return this.state.streams;
		},
		directs() {
			return this.state.directs;
		},
		searchResults() {
			return this.state.searchResults;
		}
	},
	data: () => ({
		newChannel: false,
		selectedType: null,
		selected: null
	}),
	watch: {
		state() {
			// reset state on new instance

			Object.assign(this.$data, this.$options.data.apply(this));
		}
	},
	methods: {
		createChannel() {
			this.socket.emit('channel', this.newChannel);
			this.newChannel = false;
		},
		selectChannel(channel) {
			this.selectedType = 'channel';
			this.selected = channel.id;
		},
		createDirect(user) {
			const direct = this.directs.find(direct => direct.user.id === user.id);

			if(typeof direct === 'undefined') {
				this.directs.push({
					user,
					messages: []
				});
			}
		},
		selectDirect(user) {
			this.createDirect(user);

			this.selectedType = 'direct';
			this.selected = user.id;
		},
		createMessage(text) {
			this.socket.emit('message', this.selected, text);
		},
		createDirectMessage(user, text) {
			this.socket.emit('direct-message', user.id, text);
		},
		handleSelected(type, id) {
			this.selectedType = type;
			this.selected = id;
		},
		search(query) {
			this.socket.emit('search-query', query);
		},
		selectStream(stream) {
			this.selectedType = 'stream';
			this.selected = stream.id;
		}
	},
	created() {
		Notification.requestPermission();
	},
	components: {
		Channel,
		Direct,
		Stream
	}
};
</script>
