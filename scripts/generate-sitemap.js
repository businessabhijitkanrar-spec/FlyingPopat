
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://flyingpopat.com';
const PUBLIC_DIR = path.join(__dirname, '../public');

// List of static routes in your application
const ROUTES = [
  '/',
  '/sarees',
  '/kids',
  '/catalog',
  '/contact',
  '/return-policy',
  '/shipping-policy',
  '/privacy-policy',
  '/terms-conditions',
  '/login'
];

const generateSitemap = () => {
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(route => {
    return `  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  const robotsContent = `User-agent: *
Allow: /
Sitemap: ${DOMAIN}/sitemap.xml
`;

  // Write sitemap.xml
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent);
  console.log('✅ sitemap.xml generated successfully in /public');

  // Write robots.txt
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent);
  console.log('✅ robots.txt generated successfully in /public');
};

generateSitemap();
