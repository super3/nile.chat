const fs = require('fs');
const Renderer = require('vue-server-renderer');
const Router = require('koa-router');

const Channel = require('../lib/Channel');

const router = module.exports = new Router();

const renderer = Renderer.createRenderer({
	template: fs.readFileSync(`${__dirname}/../public/index.html`, 'utf-8')
});

router.get('/sitemap.xml', async ctx => {
	const links = [{
		location: '/',
		modified: new Date(),
		change: 'daily',
		priority: 1
	}];

	ctx.body = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
	${links.map(link => `
		<url>
			<loc>https://nile.chat${link.location}</loc>
			<lastmod>${link.modified.getFullYear()}-${link.modified.getMonth() + 1}-${link.modified.getDate()}</lastmod>
			<changefreq>${link.change}</changefreq>
	        <priority>${link.priority}</priority>
		</url>
	`).join('\n')}
</urlset>`;
});

router.get('/static/:instance/channel/:channel', async ctx => {
	const channel = await Channel.get(ctx.params.instance, ctx.params.channel);

	ctx.body = JSON.stringify(channel);
});
