import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Stochastix",
  description: "High-Performance Quantitative Backtesting Engine",
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/installation' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
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
          { text: 'Multi-Timeframe Strategies', link: '/multi-timeframe-strategies' },
        ]
      },
      {
        text: 'Indicator Customization',
        items: [
          { text: 'Creating a Custom Indicator', link: '/custom-indicator-basics' },
          { text: 'Multi-Series Custom Indicators', link: '/custom-indicator-multi-series' },
          { text: 'Plotting Custom Indicators', link: '/custom-indicator-plotting' },
        ]
      },
      {
        text: 'Data Management',
        items: [
          { text: 'Downloading Market Data', link: '/data-downloading' },
          { text: 'Inspecting & Validating Data', link: '/data-validation' },
          { text: 'Inspecting Backtest Artifacts', link: '/inspecting-artifacts' },
          { text: 'Format Specification: OHLCV Data', link: '/spec-stchx' },
          { text: 'Format Specification: Time-Series Data', link: '/spec-timeseries' },
        ]
      },
      {
        text: 'Backtesting',
        items: [
          { text: 'Running a Backtest', link: '/running-backtests' },
          { text: 'Understanding the Results', link: '/understanding-results' },
          { text: 'Performance Metrics', link: '/performance-metrics' },
          { text: 'Trade Analysis with Tags', link: '/analyzing-trades' },
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
