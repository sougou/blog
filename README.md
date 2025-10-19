# Sougou.io Blog

A minimalist developer blog built with [Docusaurus](https://docusaurus.io/).

## Features

- **Blog-only mode** - Clean, focused on content
- **Minimalist design** - Developer-focused aesthetic
- **Syntax highlighting** - Support for multiple languages
- **Tags & Archive** - Easy post navigation
- **RSS/Atom feeds** - Available at `/rss.xml` and `/atom.xml`
- **Dark mode** - Respects system preferences
- **GitHub Pages deployment** - Automated with GitHub Actions

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Deployment

This blog is configured for GitHub Pages with a custom domain (sougou.io).

### Setup Steps

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions

2. **Configure Custom Domain**:
   - Add `sougou.io` in the custom domain field
   - The CNAME file is already included in `/static/CNAME`

3. **DNS Configuration**:
   - Add an A record pointing to GitHub Pages IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or add a CNAME record pointing to `<username>.github.io`

4. **Push to main branch** - GitHub Actions will automatically build and deploy

## Adding Comments

To add a comment system, you have several options:

### Option 1: Giscus (Recommended)

[Giscus](https://giscus.app/) uses GitHub Discussions for comments.

1. Install the package:
   ```bash
   npm install @giscus/react
   ```

2. Create a component at `src/components/GiscusComments.tsx`:
   ```typescript
   import React from 'react';
   import Giscus from '@giscus/react';
   import { useColorMode } from '@docusaurus/theme-common';

   export default function GiscusComments() {
     const { colorMode } = useColorMode();
     
     return (
       <Giscus
         repo="sougou/blog"
         repoId="YOUR_REPO_ID"
         category="General"
         categoryId="YOUR_CATEGORY_ID"
         mapping="pathname"
         reactionsEnabled="1"
         emitMetadata="0"
         theme={colorMode === 'dark' ? 'dark' : 'light'}
       />
     );
   }
   ```

3. Swizzle the BlogPostPage component to include comments:
   ```bash
   npm run swizzle @docusaurus/theme-classic BlogPostPage -- --wrap
   ```

### Option 2: Utterances

[Utterances](https://utteranc.es/) is a lightweight GitHub Issues-based comment system.

Similar setup to Giscus, but uses GitHub Issues instead of Discussions.

### Option 3: Disqus

Traditional comment system, but requires account creation and has ads on free tier.

## Newsletter Integration

### Option 1: ConvertKit

Add a newsletter signup form to your blog footer or blog post pages.

1. Create a form in ConvertKit
2. Add the embed code to a React component
3. Include it in your swizzled footer or blog post layout

### Option 2: Buttondown

Minimalist newsletter service perfect for developer blogs.

```html
<form
  action="https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME"
  method="post"
  target="popupwindow"
>
  <input type="email" name="email" placeholder="Enter your email" />
  <input type="submit" value="Subscribe" />
</form>
```

### Option 3: Mailchimp

Full-featured email marketing platform with generous free tier.

## Search Integration

To enable search, apply for [Algolia DocSearch](https://docsearch.algolia.com/apply/).

Once approved, uncomment the `algolia` section in `docusaurus.config.ts` and add your credentials.

## Writing Posts

Create a new markdown file in the `blog/` directory:

```markdown
---
slug: my-post-slug
title: My Post Title
authors: [sougou]
tags: [tag1, tag2]
---

Your post introduction here.

<!--truncate-->

Full post content goes here...
```

## License

[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) - You are free to share and adapt the content with attribution.
