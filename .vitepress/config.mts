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
          { text: 'Using Indicators', link: '/using-indicators' },
          { text: 'Placing Orders', link: '/placing-orders' },
          { text: 'Position Sizing', link: '/position-sizing' },
          { text: 'Plotting & Visualization', link: '/plotting' },
        ]
      },
      {
        text: 'Indicator Customization',
        items: [
          { text: 'Creating a Custom Indicator', link: '/custom-indicator-basics' },
          { text: 'Multi-Series Custom Indicators', link: '/custom-indicator-multi-series' },
          { text: 'Plotting Custom Indicators', link: '/custom-indicator-plotting' },
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
