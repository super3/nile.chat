<template>
	<Dash v-bind:instance="'big.chat'"></Dash>
</template>

<script>
const Dash = require('./Dash.vue');

module.exports = {
	components: {
		Dash
	}
};
</script>
