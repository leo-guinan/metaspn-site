import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'fs'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Load .env from project root
dotenv.config({ path: join(rootDir, '.env') })

// Escape HTML to prevent XSS
function escapeHTML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Format currency
function formatCurrency(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return value
}

// Format market cap
function formatMarketCap(value) {
  if (typeof value === 'number') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }
  return value
}

// Determine change class based on percentage
function getChangeClass(changePercent) {
  if (typeof changePercent === 'number') {
    if (changePercent > 0) return 'positive'
    if (changePercent < 0) return 'negative'
    return 'neutral'
  }
  // Try to parse string
  const num = parseFloat(changePercent)
  if (num > 0) return 'positive'
  if (num < 0) return 'negative'
  return 'neutral'
}

// Format change percentage
function formatChange(changePercent) {
  if (typeof changePercent === 'number') {
    const sign = changePercent >= 0 ? '+' : ''
    return `${sign}${changePercent.toFixed(2)}%`
  }
  return changePercent
}

// Fetch stock data from Alpha Vantage API
async function fetchStockDataFromAlphaVantage(ticker, apiKey) {
  try {
    console.log(`   Fetching data for ${ticker}...`)
    
    // Get quote (current price and change)
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
    const quoteResponse = await fetch(quoteUrl)
    const quoteData = await quoteResponse.json()
    
    // Check for API errors
    if (quoteData['Error Message']) {
      throw new Error(`Alpha Vantage error: ${quoteData['Error Message']}`)
    }
    if (quoteData['Note']) {
      throw new Error(`Alpha Vantage rate limit: ${quoteData['Note']}`)
    }
    if (quoteData['Information']) {
      // Rate limit or other info message
      throw new Error(`Alpha Vantage info: ${quoteData['Information']}`)
    }
    
    // Get overview (market cap, 52-week high/low)
    const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`
    const overviewResponse = await fetch(overviewUrl)
    const overviewData = await overviewResponse.json()
    
    if (overviewData['Error Message']) {
      throw new Error(`Alpha Vantage error: ${overviewData['Error Message']}`)
    }
    
    const quote = quoteData['Global Quote']
    if (!quote || !quote['05. price']) {
      // Log the actual response for debugging
      console.log(`   Debug: Quote data for ${ticker}:`, JSON.stringify(quoteData, null, 2))
      throw new Error(`No data returned for ${ticker}`)
    }
    
    // Parse and return data
    const price = parseFloat(quote['05. price'])
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0')
    const high52Week = parseFloat(overviewData['52WeekHigh'] || quote['03. high'] || '0')
    const low52Week = parseFloat(overviewData['52WeekLow'] || quote['04. low'] || '0')
    const marketCap = parseFloat(overviewData['MarketCapitalization'] || '0')
    
    // Validate we got actual data
    if (isNaN(price) || price === 0) {
      throw new Error(`Invalid price data for ${ticker}`)
    }
    
    return {
      price,
      changePercent,
      high52Week,
      low52Week,
      marketCap
    }
  } catch (error) {
    console.error(`   ⚠️  Error fetching ${ticker}:`, error.message)
    return null
  }
}

// Cache file path
const getCachePath = () => join(rootDir, '.stock-cache.json')

// Check if cache is valid (less than 24 hours old)
function isCacheValid(cache) {
  if (!cache || !cache.timestamp) return false
  const cacheAge = Date.now() - cache.timestamp
  const oneDay = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  return cacheAge < oneDay
}

// Load cached stock data
function loadCachedStockData() {
  const cachePath = getCachePath()
  if (!existsSync(cachePath)) {
    return null
  }
  
  try {
    const cacheContent = readFileSync(cachePath, 'utf-8')
    const cache = JSON.parse(cacheContent)
    
    if (isCacheValid(cache)) {
      console.log('   📦 Using cached stock data (less than 24 hours old)')
      return cache.data
    } else {
      console.log('   ⏰ Cache expired, fetching fresh data...')
      return null
    }
  } catch (error) {
    console.log(`   ⚠️  Error reading cache: ${error.message}`)
    return null
  }
}

// Save stock data to cache
function saveStockDataToCache(data) {
  const cachePath = getCachePath()
  const cache = {
    timestamp: Date.now(),
    data: data
  }
  
  try {
    writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8')
    console.log('   💾 Stock data cached for 24 hours')
  } catch (error) {
    console.log(`   ⚠️  Error saving cache: ${error.message}`)
  }
}

// Fetch stock data for all targets
async function fetchAllStockData(targets, apiKey) {
  // Try to load from cache first
  const cachedData = loadCachedStockData()
  if (cachedData) {
    // Merge cached data with targets (preserve other target properties)
    return targets.map(target => {
      const cached = cachedData[target.ticker]
      if (cached && cached.price && cached.price > 0) {
        return {
          ...target,
          ...cached
        }
      }
      return target
    })
  }
  
  // No valid cache, fetch from API
  if (!apiKey) {
    console.log('   ⚠️  No Alpha Vantage API key found, using manual data')
    return targets
  }
  
  console.log('   📊 Fetching real stock data from Alpha Vantage...')
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 4)}...` : 'NOT SET'}`)
  
  const updatedTargets = []
  const cacheData = {}
  
  for (const target of targets) {
    try {
      const stockData = await fetchStockDataFromAlphaVantage(target.ticker, apiKey)
      
      if (stockData && stockData.price && stockData.price > 0) {
        // Store in cache object
        cacheData[target.ticker] = stockData
        
        // Merge fetched data with existing target data (preserve company name, analysis, etc.)
        updatedTargets.push({
          ...target,
          ...stockData
        })
        console.log(`   ✅ Updated ${target.ticker}: $${stockData.price.toFixed(2)} (${formatChange(stockData.changePercent)})`)
      } else {
        // Use original data if fetch failed or returned invalid data
        console.log(`   ⚠️  Using manual data for ${target.ticker} (fetch failed or returned invalid data)`)
        updatedTargets.push(target)
      }
    } catch (error) {
      console.log(`   ⚠️  Error processing ${target.ticker}: ${error.message}`)
      updatedTargets.push(target)
    }
    
    // Rate limiting: Alpha Vantage free tier allows 5 calls per minute
    // Wait 12 seconds between calls to be safe
    if (targets.indexOf(target) < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 12000))
    }
  }
  
  // Save to cache if we got any valid data
  if (Object.keys(cacheData).length > 0) {
    saveStockDataToCache(cacheData)
  }
  
  return updatedTargets
}

// Generate competition page from template
function generateCompetitionPage(competitionData, template) {
  const {
    slug,
    name,
    description,
    collapseDate,
    targets,
    opportunityZones
  } = competitionData
  
  let html = template
  
  // Replace basic placeholders
  html = html.replace(/COMPETITION_SLUG/g, escapeHTML(slug))
  html = html.replace(/COMPETITION_NAME/g, escapeHTML(name))
  
  // Replace target data FIRST (before general COLLAPSE_DATE replacement)
  // This prevents TARGET_1_COLLAPSE_DATE from being partially replaced
  targets.forEach((target, index) => {
    const num = index + 1
    const changeClass = getChangeClass(target.changePercent)
    
    html = html.replace(new RegExp(`TARGET_${num}_TICKER`, 'g'), escapeHTML(target.ticker))
    html = html.replace(new RegExp(`TARGET_${num}_COMPANY`, 'g'), escapeHTML(target.company))
    html = html.replace(new RegExp(`TARGET_${num}_PRICE`, 'g'), formatCurrency(target.price))
    // Replace CHANGE_CLASS before CHANGE to avoid partial replacement
    html = html.replace(new RegExp(`TARGET_${num}_CHANGE_CLASS`, 'g'), changeClass)
    html = html.replace(new RegExp(`TARGET_${num}_CHANGE`, 'g'), formatChange(target.changePercent))
    html = html.replace(new RegExp(`TARGET_${num}_HIGH`, 'g'), formatCurrency(target.high52Week))
    html = html.replace(new RegExp(`TARGET_${num}_LOW`, 'g'), formatCurrency(target.low52Week))
    html = html.replace(new RegExp(`TARGET_${num}_MCAP`, 'g'), formatMarketCap(target.marketCap))
    html = html.replace(new RegExp(`TARGET_${num}_ANALYSIS`, 'g'), escapeHTML(target.analysis))
    
    // Replace collapse timer dates (must happen before general COLLAPSE_DATE replacement)
    if (target.collapseTimer) {
      html = html.replace(new RegExp(`TARGET_${num}_COLLAPSE_DATE`, 'g'), target.collapseTimer)
    }
    
    // Replace why vulnerable
    if (target.whyVulnerable) {
      html = html.replace(new RegExp(`TARGET_${num}_WHY_VULNERABLE`, 'g'), escapeHTML(target.whyVulnerable))
    }
  })
  
  // Replace general collapse date LAST (after all TARGET_X_COLLAPSE_DATE replacements)
  if (collapseDate) {
    html = html.replace(/COLLAPSE_DATE/g, collapseDate)
  }
  
  return html
}

// Example usage
async function main() {
  console.log('🚀 Generating competition page...')
  
  try {
    // Read template - use LoveMax League template if it exists, otherwise use generic
    const lovemaxTemplate = join(rootDir, 'lovemax-league-template.html')
    const genericTemplate = join(rootDir, 'competition-market-opportunity-template.html')
    
    let template
    try {
      template = readFileSync(lovemaxTemplate, 'utf-8')
      console.log('   Using LoveMax League template')
    } catch {
      template = readFileSync(genericTemplate, 'utf-8')
      console.log('   Using generic competition template')
    }
    
    // Get API key from environment
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    
    // LoveMax League Competition Data
    const competitionData = {
      slug: 'lovemax-league',
      name: 'The Great Relationship Market Collapse',
      description: 'A public, real-time countdown to when the legacy dating economy hits zero. The dating app market is a bubble built on misalignment and emotional residue. They profit from failure. They collapse when coherent alternatives emerge.',
      collapseDate: '2026-12-31T23:59:59', // Set your expected collapse date
      targets: [
        {
          ticker: 'MTCH',
          company: 'Match Group Inc.',
          price: 35.50, // Fallback price if API fails
          changePercent: -2.5,
          high52Week: 48.20,
          low52Week: 28.10,
          marketCap: 9500000000,
          collapseTimer: '2025-12-31T23:59:59', // Expected collapse date for MTCH
          failureVectors: [
            'burnout loops',
            'misalignment incentives',
            'infinite churn',
            'messaging residue',
            'no pacing models',
            'trust decay',
            'stagnating revenue per user'
          ],
          whyVulnerable: 'Match depends on people not finding love. LoveMax competitors directly attack this incentive structure.',
          analysis: 'Match Group represents the most vulnerable incumbent. Their business model profits from failure—they make money when people don\'t find lasting connections. LoveMax competitors directly attack this incentive structure by creating systems that succeed when people succeed.'
        },
        {
          ticker: 'BMBL',
          company: 'Bumble Inc.',
          price: 12.80, // Fallback price if API fails
          changePercent: -1.8,
          high52Week: 18.50,
          low52Week: 10.20,
          marketCap: 1600000000,
          collapseTimer: '2026-06-30T23:59:59',
          failureVectors: [
            'women-overburdened cognitive load',
            'messaging asymmetry',
            'emotional residue carryover',
            'incentive misalignment',
            'safety perception gaps',
            'tiny success rate relative to time spent'
          ],
          whyVulnerable: 'LoveMax competitors remove cognitive load by pacing and spark alignment. Bumble has no defense against this.',
          analysis: 'Bumble is in a transitional phase, attempting to adapt with women-first features but struggling with fundamental misalignments. They represent the middle ground—vulnerable to disruption but still holding significant market position. LoveMax competitors remove cognitive load by pacing and spark alignment.'
        },
        {
          ticker: 'GRND',
          company: 'Grindr Inc.',
          price: 8.40, // Fallback price if API fails
          changePercent: -0.5,
          high52Week: 12.30,
          low52Week: 6.80,
          marketCap: 850000000,
          collapseTimer: '2026-09-30T23:59:59',
          failureVectors: [
            'burnout churn',
            'high emotional volatility',
            'disintermediated community',
            'residual fear loops',
            'safety misalignments',
            'trust decay'
          ],
          whyVulnerable: 'LoveMax competitors build coherence locally. Grindr is a high-entropy environment.',
          analysis: 'Grindr represents the emerging challenger that gained traction but still has fundamental issues. They validate the market opportunity while demonstrating what needs to be fixed. LoveMax competitors build coherence locally, while Grindr remains a high-entropy environment.'
        }
      ],
      opportunityZones: [
        {
          id: 'A',
          name: 'Spark Generation',
          description: 'Outcompetes the "swipe economy" with better initiations.'
        },
        {
          id: 'B',
          name: 'Pacing Mechanics',
          description: 'Outcompetes churn-based engagement models.'
        },
        {
          id: 'C',
          name: 'Zero Bad Dates',
          description: 'Outcompetes apps that tolerate or produce bad outcomes.'
        },
        {
          id: 'D',
          name: 'Emotional Residue Cleanup',
          description: 'Outcompetes the residue loops legacy apps cannot fix.'
        },
        {
          id: 'E',
          name: 'Intervention Design',
          description: 'Outcompetes the total absence of crisis-to-care pipelines.'
        },
        {
          id: 'F',
          name: 'Community Repair Pods',
          description: 'Outcompetes the isolating nature of existing apps.'
        }
      ]
    }
    
    // Fetch real stock data if API key is available
    const targetsWithRealData = await fetchAllStockData(competitionData.targets, apiKey)
    competitionData.targets = targetsWithRealData
    
    // Generate HTML
    const html = generateCompetitionPage(competitionData, template)
    
    // Ensure competitions directory exists
    const competitionsDir = join(rootDir, 'competitions')
    mkdirSync(competitionsDir, { recursive: true })
    
    // Write file
    const filePath = join(competitionsDir, `${competitionData.slug}.html`)
    writeFileSync(filePath, html, 'utf-8')
    
    console.log(`✅ Generated competition page: ${filePath}`)
    console.log(`   Competition: ${competitionData.name}`)
    console.log(`   Targets: ${competitionData.targets.length}`)
    
  } catch (error) {
    console.error('❌ Error generating competition page:', error)
    process.exit(1)
  }
}

// Run if called directly (not imported)
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('generate-competition-page.js')

if (isMainModule) {
  main()
}

export { generateCompetitionPage, formatCurrency, formatMarketCap, formatChange, getChangeClass, fetchStockDataFromAlphaVantage, fetchAllStockData }

