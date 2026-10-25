import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://atharva-shewale.vercel.app',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
});
