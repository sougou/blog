import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "sougou.io",
  tagline: "Developer blog",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://sougou.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "sougou", // Usually your GitHub org/user name.
  projectName: "blog", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false, // Disable docs for blog-only mode
        blog: {
          routeBasePath: "/", // Serve blog at root
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.jpg",
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "sougou.io",
      hideOnScroll: true,
      items: [
        {
          to: "/archive",
          label: "Archive",
          position: "left",
        },
        {
          to: "/tags",
          label: "Tags",
          position: "left",
        },
        {
          to: "/about",
          label: "About",
          position: "left",
        },
        {
          href: "https://github.com/sougou",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Blog",
          items: [
            {
              label: "Archive",
              to: "/archive",
            },
            {
              label: "Tags",
              to: "/tags",
            },
          ],
        },
        {
          title: "Connect",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/sougou",
            },
            {
              label: "X",
              href: "https://x.com/ssougou",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/sougou/",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Sugu Sougoumarane. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: [
        "bash",
        "json",
        "yaml",
        "typescript",
        "javascript",
        "go",
        "python",
        "java",
      ],
    },
    // Algolia DocSearch configuration (you'll need to apply for this)
    // Uncomment and configure after applying at https://docsearch.algolia.com/apply/
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'sougou',
    // },
  } satisfies Preset.ThemeConfig,
};

export default config;
