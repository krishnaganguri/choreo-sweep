# Deployment Guide

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- Supabase project (for backend)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/myhomemanager.git
cd myhomemanager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at `http://localhost:3000`

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. The build output will be in the `dist` directory

## Deployment Options

### 1. Static Hosting (Recommended)

#### Vercel
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### Netlify
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard

#### GitHub Pages
1. Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/myhomemanager/',
  // ... other config
})
```

2. Deploy:
```bash
npm run build
git add dist
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

### 2. Traditional Web Server

#### Nginx Configuration
Create `/etc/nginx/sites-available/myhomemanager`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/myhomemanager;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

#### Apache Configuration
Create `.htaccess` in the build directory:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set X-Content-Type-Options "nosniff"
```

## Continuous Deployment

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Post-Deployment Checklist

1. Verify environment variables are set correctly
2. Test authentication flow
3. Check all features are working
4. Verify responsive design
5. Test performance and loading times
6. Check security headers
7. Verify caching is working
8. Test error handling
9. Check console for any errors
10. Verify analytics tracking

## Monitoring and Maintenance

1. Set up error tracking (e.g., Sentry)
2. Configure performance monitoring
3. Set up uptime monitoring
4. Regular dependency updates
5. Security vulnerability scanning
6. Regular backups of user data
7. Performance optimization
8. Regular security audits

## Troubleshooting

### Common Issues

1. **Authentication Not Working**
   - Check Supabase credentials
   - Verify CORS settings
   - Check network requests

2. **Assets Not Loading**
   - Verify asset paths
   - Check cache settings
   - Verify file permissions

3. **Performance Issues**
   - Check bundle size
   - Verify caching headers
   - Optimize images
   - Enable compression

4. **CORS Errors**
   - Verify allowed origins
   - Check Supabase configuration
   - Update security headers

### Debugging

1. Check browser console
2. Review server logs
3. Test API endpoints
4. Verify environment variables
5. Check network requests
6. Test on different browsers
7. Verify mobile responsiveness 