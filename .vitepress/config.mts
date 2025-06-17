import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Stochastix",
  description: "High-Performance Quantitative Backtesting Engine",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: "What's Stochastix?", link: '/introduction' },
          { text: 'Docker Tooling', link: '/docker-tooling' },
          { text: 'Project Structure', link: '/project-structure' },
          { text: 'Core Concepts', link: '/core-concepts' },
          { text: 'Configuration', link: '/configuration' },
        ]
      },
      {
        text: 'Writing strategies',
        items: [
          { text: 'Anatomy of a Strategy', link: '/anatomy' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/phpquant/stochastix-core' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present William Arin'
    }
  }
})
