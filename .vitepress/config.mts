import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Stochastix",
  description: "High-Performance Quantitative Backtesting Engine",
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
