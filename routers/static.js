const fs = require('fs');
const Renderer = require('vue-server-renderer');
const Router = require('koa-router');

const Channel = require('../lib/Channel');

const router = module.exports = new Router();

const renderer = Renderer.createRenderer({
	template: fs.readFileSync(`${__dirname}/../public/index.html`, 'utf-8')
});

router.get('/:instance/channel/:channel', async ctx => {
	const channel = await Channel.get(ctx.params.instance, ctx.params.channel);

	ctx.body = JSON.stringify(channel);
});
