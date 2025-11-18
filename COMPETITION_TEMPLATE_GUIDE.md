# Competition Market Opportunity Template Guide

This template is designed for creating competition pages that track three public stock targets representing the "cascade order" in a market opportunity.

## Overview

The template displays:
- **Market Context**: Explanation of why these targets matter
- **Three Stock Targets**: Public companies in cascade order (most vulnerable → transitional → emerging challenger)
- **Stock Data**: Current price, change percentage, 52-week high/low, market cap
- **Analysis**: Why each target matters for competitors

## File Structure

```
competition-market-opportunity-template.html  # Template file
scripts/generate-competition-page.js            # Script to populate template
competitions/                                   # Output directory (created automatically)
```

## Usage

### Option 1: Manual Editing

1. Copy `competition-market-opportunity-template.html` to `competitions/YOUR_COMPETITION_SLUG.html`
2. Replace all placeholders:
   - `COMPETITION_SLUG` - URL-friendly identifier
   - `COMPETITION_NAME` - Display name
   - `TARGET_1_TICKER`, `TARGET_2_TICKER`, `TARGET_3_TICKER` - Stock ticker symbols
   - `TARGET_X_COMPANY` - Company name
   - `TARGET_X_PRICE` - Current stock price
   - `TARGET_X_CHANGE` - Price change percentage (e.g., "+2.34%" or "-1.23%")
   - `TARGET_X_CHANGE_CLASS` - CSS class: `positive`, `negative`, or `neutral`
   - `TARGET_X_HIGH` - 52-week high price
   - `TARGET_X_LOW` - 52-week low price
   - `TARGET_X_MCAP` - Market capitalization
   - `TARGET_X_ANALYSIS` - Analysis text explaining why this target matters

### Option 2: Using the Script

1. Edit `scripts/generate-competition-page.js`
2. Update the `competitionData` object with your competition details
3. Run: `node scripts/generate-competition-page.js`

Example data structure:

```javascript
const competitionData = {
  slug: 'dating-market',
  name: 'Dating Market Opportunity',
  description: 'Tracking three public dating companies...',
  targets: [
    {
      ticker: 'MTCH',
      company: 'Match Group Inc.',
      price: 45.67,
      changePercent: -2.34,
      high52Week: 89.50,
      low52Week: 32.10,
      marketCap: 5.2e9, // $5.2B
      analysis: 'Why this target matters...'
    },
    // ... two more targets
  ]
}
```

## Stock Data Sources

You can integrate with stock APIs to fetch real-time data:

### Free APIs:

**Alpha Vantage** (Recommended for this use case)
- ✅ **Free tier**: 25 API requests per day
- ✅ No credit card required
- ✅ Lifetime free access
- ⚠️ Delayed data (not real-time)
- 📝 Sign up: https://www.alphavantage.co/support/#api-key
- 📚 Docs: https://www.alphavantage.co/documentation/

**Finnhub**
- ✅ Free tier available
- ✅ ~60 calls/minute
- ⚠️ Delayed data
- 📝 Sign up: https://finnhub.io/
- 📚 Docs: https://finnhub.io/docs/api

**Other Options:**
- **Yahoo Finance**: Unofficial API (free but unreliable, use at your own risk)
- **Polygon.io**: Free tier with limited calls
- **Twelve Data**: Free tier with daily limits

### Recommendation

For tracking 3 stocks updated periodically (e.g., once per day or on page load), **Alpha Vantage's free tier is perfect** - 25 requests/day is more than enough for 3 stocks.

### Example Integration (Alpha Vantage):

```javascript
// In the template's script section, add:
async function fetchStockData(ticker, apiKey) {
  // Get quote endpoint
  const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
  const quoteResponse = await fetch(quoteUrl);
  const quoteData = await quoteResponse.json();
  
  // Get overview for market cap and 52-week data
  const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
  const overviewResponse = await fetch(overviewUrl);
  const overviewData = await overviewResponse.json();
  
  const quote = quoteData['Global Quote'];
  return {
    price: parseFloat(quote['05. price']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    high52Week: parseFloat(overviewData['52WeekHigh']),
    low52Week: parseFloat(overviewData['52WeekLow']),
    marketCap: parseFloat(overviewData['MarketCapitalization'])
  };
}

// Usage (store API key securely - don't expose in client-side code!)
// Better: fetch from your own backend that has the API key
const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';
const stockData = await fetchStockData('MTCH', API_KEY);
```

**⚠️ Important**: Don't expose your API key in client-side JavaScript! Instead:
1. Create a backend endpoint that proxies requests to Alpha Vantage
2. Store the API key on your server
3. Call your backend endpoint from the frontend

## Placeholders Reference

| Placeholder | Description | Example |
|------------|-------------|---------|
| `COMPETITION_SLUG` | URL-friendly identifier | `dating-market` |
| `COMPETITION_NAME` | Display name | `Dating Market Opportunity` |
| `TARGET_X_TICKER` | Stock ticker | `MTCH` |
| `TARGET_X_COMPANY` | Company name | `Match Group Inc.` |
| `TARGET_X_PRICE` | Current price | `$45.67` |
| `TARGET_X_CHANGE` | Change % | `+2.34%` or `-1.23%` |
| `TARGET_X_CHANGE_CLASS` | CSS class | `positive`, `negative`, `neutral` |
| `TARGET_X_HIGH` | 52W high | `$89.50` |
| `TARGET_X_LOW` | 52W low | `$32.10` |
| `TARGET_X_MCAP` | Market cap | `$5.2B` |
| `TARGET_X_ANALYSIS` | Analysis text | Full paragraph |

## Cascade Order

The three targets should represent:

1. **Target 1 (Most Vulnerable)**: The incumbent most at risk of disruption
2. **Target 2 (Transitional)**: A company trying to adapt but struggling
3. **Target 3 (Emerging Challenger)**: The new model gaining traction

This order helps competitors understand the market dynamics and where opportunities lie.

## Styling

The template uses the existing MetaSPN design system:
- Dark theme with neon blue accents
- Responsive grid layout
- Hover effects on target cards
- Color-coded price changes (green/red/neutral)

## Next Steps

1. Create your competition page using the template
2. Add it to your competitions index/navigation
3. Consider adding real-time stock price updates via API
4. Add links from the main landing page to competition pages

