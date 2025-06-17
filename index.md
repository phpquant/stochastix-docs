---
layout: home

hero:
  name: "Stochastix"
  text: "High-Performance Quantitative Backtesting Engine"
  tagline: "From hypothesis to statistical proof. A PHP framework to build, test, and analyze your crypto-currencies trading strategies."
  image:
    src: /logo.svg
    alt: Stochastix
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: View on GitHub
      link: https://github.com/phpquant/stochastix-core

features:
  - title: "Realistic Simulation Engine"
    details: "Process data bar-by-bar with a sophisticated order management system supporting Market, Limit, and Stop orders with automated Stop-Loss/Take-Profit handling."
  - title: "Institutional-Grade Metrics"
    details: "Go beyond P/L. Automatically calculate dozens of metrics like Sharpe & Sortino Ratios, Alpha, Beta, CAGR, and Max Drawdown to truly understand your strategy's risk and reward."
  - title: "Optimized for Performance"
    details: "Leverages custom binary formats for market and results data, combined with high-performance PHP extensions (ds, bcmath) to process massive datasets with maximum speed and precision."
  - title: "Modern Developer Experience"
    details: "Built on the robust Symfony framework. Define strategies and their inputs with simple, clean PHP attributes for a seamless and intuitive development workflow."
---

<div class="image-container" style="display: flex; gap: 1rem; justify-content: space-around; margin-top: 4rem; flex-wrap: wrap;">

  <div class="image-column" style="flex: 1; min-width: 300px; max-width: 32%;">
    <a href="./installation" title="Get Started with Stochastix">
      <img src="/screenshots/new_backtest.jpg" alt="Configure a new backtest in Stochastix" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); transition: transform 0.2s ease;">
    </a>
  </div>

  <div class="image-column" style="flex: 1; min-width: 300px; max-width: 32%;">
    <a href="./installation" title="Get Started with Stochastix">
      <img src="/screenshots/backtest_results.jpg" alt="Analyze detailed backtest results and trade logs" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); transition: transform 0.2s ease;">
    </a>
  </div>

  <div class="image-column" style="flex: 1; min-width: 300px; max-width: 32%;">
    <a href="./installation" title="Get Started with Stochastix">
      <img src="/screenshots/backtest_chart.jpg" alt="Visualize performance with interactive charts" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); transition: transform 0.2s ease;">
    </a>
  </div>

</div>

<style>
  .image-column img:hover {
    transform: scale(1.03);
  }
</style>
