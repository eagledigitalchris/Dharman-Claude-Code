"""
Niche Perfume Price Tracker - Complete API with Real-Time Price Comparison
"""
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import asyncio
import re
import logging
import json
from urllib.parse import quote_plus, urljoin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Schemas
class PriceResult(BaseModel):
    store_name: str
    store_url: str
    product_name: str
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[float] = None
    size: Optional[str] = None
    product_url: str
    in_stock: bool = True
    is_tester: bool = False


class SearchResponse(BaseModel):
    query: str
    results: List[PriceResult]
    total_stores_searched: int
    stores_with_results: int
    searched_at: str


# Store configurations
STORES = [
    {
        "name": "FragranceX",
        "slug": "fragrancex",
        "base_url": "https://www.fragrancex.com",
        "search_url": "https://www.fragrancex.com/search?q={query}",
        "discount_range": "30-50%"
    },
    {
        "name": "FragranceNet",
        "slug": "fragrancenet",
        "base_url": "https://www.fragrancenet.com",
        "search_url": "https://www.fragrancenet.com/search?searchTerm={query}",
        "discount_range": "35-60%"
    },
    {
        "name": "MaxAroma",
        "slug": "maxaroma",
        "base_url": "https://www.maxaroma.com",
        "search_url": "https://www.maxaroma.com/search?q={query}",
        "discount_range": "20-40%"
    },
    {
        "name": "Jomashop",
        "slug": "jomashop",
        "base_url": "https://www.jomashop.com",
        "search_url": "https://www.jomashop.com/catalogsearch/result/?q={query}",
        "discount_range": "15-35%"
    },
    {
        "name": "FragranceBuy",
        "slug": "fragrancebuy",
        "base_url": "https://fragrancebuy.ca",
        "search_url": "https://fragrancebuy.ca/search?type=product&q={query}",
        "discount_range": "20-35%"
    },
    {
        "name": "Aura Fragrances",
        "slug": "aurafragrances",
        "base_url": "https://aurafragrances.com",
        "search_url": "https://aurafragrances.com/search?q={query}",
        "discount_range": "40-60%"
    },
    {
        "name": "Venba Fragrance",
        "slug": "venba",
        "base_url": "https://venbafragrance.com",
        "search_url": "https://venbafragrance.com/search?q={query}",
        "discount_range": "25-45%"
    },
    {
        "name": "Olfactory Factory",
        "slug": "olfactory",
        "base_url": "https://olfactoryfactoryllc.com",
        "search_url": "https://olfactoryfactoryllc.com/search?q={query}",
        "discount_range": "30-50%"
    },
    {
        "name": "Niche Gallery",
        "slug": "nichegallery",
        "base_url": "https://nichegallerie.com",
        "search_url": "https://nichegallerie.com/search?q={query}",
        "discount_range": "30-70%"
    },
    {
        "name": "Perfume Online",
        "slug": "perfumeonline",
        "base_url": "https://perfumeonline.ca",
        "search_url": "https://perfumeonline.ca/search?q={query}",
        "discount_range": "25-40%"
    }
]


# App
app = FastAPI(
    title="Niche Perfume Price Tracker API",
    description="API para comparação de preços de perfumes de nicho em 10 lojas gray market",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def clean_price(price_text: str) -> Optional[float]:
    """Extract numeric price from text"""
    if not price_text:
        return None
    try:
        cleaned = re.sub(r'[^\d.,]', '', price_text.strip())
        if ',' in cleaned and '.' in cleaned:
            if cleaned.index(',') > cleaned.index('.'):
                cleaned = cleaned.replace('.', '').replace(',', '.')
            else:
                cleaned = cleaned.replace(',', '')
        elif ',' in cleaned:
            parts = cleaned.split(',')
            if len(parts[-1]) == 2:
                cleaned = cleaned.replace(',', '.')
            else:
                cleaned = cleaned.replace(',', '')
        return float(cleaned) if cleaned else None
    except:
        return None


def extract_size(text: str) -> Optional[str]:
    """Extract size from product name"""
    if not text:
        return None
    ml_match = re.search(r'(\d+(?:\.\d+)?)\s*ml', text.lower())
    if ml_match:
        return f"{ml_match.group(1)} ml"
    oz_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:fl\.?\s*)?oz', text.lower())
    if oz_match:
        return f"{oz_match.group(1)} oz"
    return None


async def search_store(client: httpx.AsyncClient, store: Dict, query: str) -> List[Dict]:
    """Search a single store for the query"""
    results = []
    search_url = store["search_url"].format(query=quote_plus(query))

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

        response = await client.get(search_url, headers=headers, timeout=15.0, follow_redirects=True)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')

            # Generic product selectors that work across most e-commerce sites
            product_selectors = [
                'div.product-card', 'div.product-item', 'div.product',
                'article.product', 'li.product', 'div.grid-item',
                'div.search-result-item', 'div.product-tile',
                '[data-product-id]', '.product-grid-item'
            ]

            products = []
            for selector in product_selectors:
                products = soup.select(selector)
                if products:
                    break

            # If no products found with specific selectors, try generic approach
            if not products:
                # Look for any container with price-like content
                products = soup.find_all(lambda tag: tag.name == 'div' and
                                        tag.find(string=re.compile(r'\$\d+\.?\d*')))[:10]

            for product in products[:5]:  # Limit to 5 per store
                try:
                    # Extract product name
                    name_elem = product.select_one('h2, h3, h4, .product-name, .product-title, a.product-link, [class*="title"], [class*="name"]')
                    name = name_elem.get_text(strip=True) if name_elem else None

                    if not name or len(name) < 3:
                        continue

                    # Check if product matches query
                    query_words = query.lower().split()
                    name_lower = name.lower()
                    if not any(word in name_lower for word in query_words):
                        continue

                    # Extract price
                    price_elem = product.select_one('.price, .product-price, [class*="price"], .sale-price, .current-price')
                    price_text = price_elem.get_text(strip=True) if price_elem else None
                    price = clean_price(price_text)

                    if not price or price <= 0:
                        continue

                    # Extract original price if available
                    original_elem = product.select_one('.original-price, .compare-price, .was-price, .list-price, [class*="compare"]')
                    original_price = clean_price(original_elem.get_text(strip=True)) if original_elem else None

                    # Extract product URL
                    link_elem = product.select_one('a[href*="/product"], a[href*="/products/"], a.product-link, a[href]')
                    product_url = None
                    if link_elem and link_elem.get('href'):
                        href = link_elem.get('href')
                        if href.startswith('http'):
                            product_url = href
                        elif href.startswith('/'):
                            product_url = urljoin(store["base_url"], href)

                    if not product_url:
                        product_url = search_url

                    # Calculate discount
                    discount = None
                    if original_price and original_price > price:
                        discount = round(((original_price - price) / original_price) * 100, 1)

                    # Check for tester
                    is_tester = 'tester' in name.lower() or 'unbox' in name.lower()

                    results.append({
                        "store_name": store["name"],
                        "store_url": store["base_url"],
                        "product_name": name,
                        "price": price,
                        "original_price": original_price,
                        "discount_percent": discount,
                        "size": extract_size(name),
                        "product_url": product_url,
                        "in_stock": True,
                        "is_tester": is_tester
                    })

                except Exception as e:
                    logger.debug(f"Error parsing product from {store['name']}: {e}")
                    continue

    except httpx.TimeoutException:
        logger.warning(f"Timeout searching {store['name']}")
    except Exception as e:
        logger.warning(f"Error searching {store['name']}: {e}")

    return results


async def search_all_stores(query: str) -> Dict[str, Any]:
    """Search all stores in parallel"""
    all_results = []
    stores_with_results = 0

    async with httpx.AsyncClient() as client:
        tasks = [search_store(client, store, query) for store in STORES]
        store_results = await asyncio.gather(*tasks, return_exceptions=True)

        for i, result in enumerate(store_results):
            if isinstance(result, list) and len(result) > 0:
                all_results.extend(result)
                stores_with_results += 1

    # Sort by price (lowest first)
    all_results.sort(key=lambda x: x["price"])

    return {
        "query": query,
        "results": all_results,
        "total_stores_searched": len(STORES),
        "stores_with_results": stores_with_results,
        "searched_at": datetime.utcnow().isoformat()
    }


# HTML Frontend
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧴 Niche Perfume Price Tracker</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #fff;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }

        header {
            text-align: center;
            padding: 40px 20px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #94a3b8; font-size: 1.1rem; }

        .search-box {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .search-form {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
        }
        input[type="text"] {
            flex: 1;
            min-width: 300px;
            padding: 15px 25px;
            font-size: 1.1rem;
            border: none;
            border-radius: 50px;
            background: rgba(255,255,255,0.9);
            color: #1a1a2e;
        }
        input[type="text"]:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.5);
        }
        button {
            padding: 15px 40px;
            font-size: 1.1rem;
            font-weight: 600;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
            color: white;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .stores-info {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        .store-badge {
            background: rgba(255,255,255,0.1);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            color: #94a3b8;
        }

        .progress-container {
            display: none;
            margin: 30px 0;
            text-align: center;
        }
        .progress-bar {
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
            overflow: hidden;
            margin: 15px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
            border-radius: 3px;
            width: 0%;
            animation: progress 3s ease-in-out infinite;
        }
        @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
        }

        .results-container { margin-top: 30px; }
        .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .results-count {
            font-size: 1.2rem;
            color: #e94560;
        }
        .sort-options select {
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            background: rgba(255,255,255,0.1);
            color: white;
            cursor: pointer;
        }

        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
        .result-card {
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.2s, border-color 0.2s;
        }
        .result-card:hover {
            transform: translateY(-5px);
            border-color: #e94560;
        }
        .result-card.best-deal {
            border: 2px solid #10b981;
            background: rgba(16, 185, 129, 0.1);
        }
        .best-badge {
            background: #10b981;
            color: white;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 10px;
            display: inline-block;
        }

        .store-name {
            color: #94a3b8;
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .price-row {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 10px;
        }
        .current-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10b981;
        }
        .original-price {
            font-size: 1rem;
            color: #94a3b8;
            text-decoration: line-through;
        }
        .discount-badge {
            background: #ef4444;
            color: white;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .size-info {
            color: #94a3b8;
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        .tester-badge {
            background: #f59e0b;
            color: #1a1a2e;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 5px;
        }
        .buy-button {
            display: block;
            width: 100%;
            padding: 12px;
            text-align: center;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: opacity 0.2s;
        }
        .buy-button:hover { opacity: 0.9; }

        .no-results {
            text-align: center;
            padding: 60px 20px;
            color: #94a3b8;
        }
        .no-results h3 { font-size: 1.5rem; margin-bottom: 10px; color: #fff; }

        .popular-searches {
            margin-top: 40px;
            text-align: center;
        }
        .popular-searches h3 {
            color: #94a3b8;
            font-size: 1rem;
            margin-bottom: 15px;
        }
        .popular-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }
        .popular-tag {
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            transition: background 0.2s;
            border: none;
            color: white;
            font-size: 0.9rem;
        }
        .popular-tag:hover { background: rgba(233, 69, 96, 0.3); }

        footer {
            text-align: center;
            padding: 40px 20px;
            color: #64748b;
            font-size: 0.9rem;
        }
        footer a { color: #e94560; text-decoration: none; }

        @media (max-width: 600px) {
            h1 { font-size: 1.8rem; }
            input[type="text"] { min-width: 100%; }
            .search-form { flex-direction: column; }
            button { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧴 Niche Perfume Price Tracker</h1>
            <p class="subtitle">Compare prices across 10 gray market stores in the US & Canada</p>
        </header>

        <div class="search-box">
            <form class="search-form" onsubmit="searchPerfume(event)">
                <input type="text" id="searchInput" placeholder="Search perfume (e.g., Aventus, Baccarat Rouge, Layton)" required>
                <button type="submit" id="searchBtn">🔍 Search Prices</button>
            </form>
            <div class="stores-info">
                <span class="store-badge">FragranceX</span>
                <span class="store-badge">FragranceNet</span>
                <span class="store-badge">MaxAroma</span>
                <span class="store-badge">Jomashop</span>
                <span class="store-badge">FragranceBuy</span>
                <span class="store-badge">Aura Fragrances</span>
                <span class="store-badge">Venba</span>
                <span class="store-badge">Olfactory Factory</span>
                <span class="store-badge">Niche Gallery</span>
                <span class="store-badge">Perfume Online</span>
            </div>
        </div>

        <div class="progress-container" id="progressContainer">
            <p>🔍 Searching across 10 stores...</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p id="progressText">Comparing prices...</p>
        </div>

        <div class="results-container" id="resultsContainer"></div>

        <div class="popular-searches">
            <h3>Popular Searches</h3>
            <div class="popular-tags">
                <button class="popular-tag" onclick="quickSearch('Creed Aventus')">Creed Aventus</button>
                <button class="popular-tag" onclick="quickSearch('Baccarat Rouge 540')">Baccarat Rouge 540</button>
                <button class="popular-tag" onclick="quickSearch('Parfums de Marly Layton')">PDM Layton</button>
                <button class="popular-tag" onclick="quickSearch('Tom Ford Oud Wood')">Tom Ford Oud Wood</button>
                <button class="popular-tag" onclick="quickSearch('Initio Side Effect')">Initio Side Effect</button>
                <button class="popular-tag" onclick="quickSearch('Xerjoff Naxos')">Xerjoff Naxos</button>
                <button class="popular-tag" onclick="quickSearch('Le Labo Santal 33')">Le Labo Santal 33</button>
                <button class="popular-tag" onclick="quickSearch('Amouage Reflection')">Amouage Reflection</button>
            </div>
        </div>

        <footer>
            <p>Data refreshed in real-time from 10 gray market stores</p>
            <p>Built with ❤️ for fragrance enthusiasts</p>
        </footer>
    </div>

    <script>
        function quickSearch(term) {
            document.getElementById('searchInput').value = term;
            searchPerfume(new Event('submit'));
        }

        async function searchPerfume(e) {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;

            const btn = document.getElementById('searchBtn');
            const progress = document.getElementById('progressContainer');
            const results = document.getElementById('resultsContainer');

            btn.disabled = true;
            btn.textContent = '⏳ Searching...';
            progress.style.display = 'block';
            results.innerHTML = '';

            try {
                const response = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                progress.style.display = 'none';
                displayResults(data);
            } catch (error) {
                progress.style.display = 'none';
                results.innerHTML = `
                    <div class="no-results">
                        <h3>❌ Error</h3>
                        <p>Failed to search. Please try again.</p>
                    </div>
                `;
            }

            btn.disabled = false;
            btn.textContent = '🔍 Search Prices';
        }

        function displayResults(data) {
            const container = document.getElementById('resultsContainer');

            if (!data.results || data.results.length === 0) {
                container.innerHTML = `
                    <div class="no-results">
                        <h3>No results found</h3>
                        <p>Try searching with different keywords or check the popular searches below.</p>
                        <p style="margin-top:15px; font-size:0.9rem;">Stores searched: ${data.total_stores_searched} | Tip: Try brand + perfume name</p>
                    </div>
                `;
                return;
            }

            const lowestPrice = Math.min(...data.results.map(r => r.price));

            let html = `
                <div class="results-header">
                    <span class="results-count">Found ${data.results.length} results from ${data.stores_with_results} stores</span>
                    <div class="sort-options">
                        <select onchange="sortResults(this.value)">
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="discount">Highest Discount</option>
                        </select>
                    </div>
                </div>
                <div class="results-grid" id="resultsGrid">
            `;

            data.results.forEach((result, index) => {
                const isBest = result.price === lowestPrice && index === 0;
                html += `
                    <div class="result-card ${isBest ? 'best-deal' : ''}" data-price="${result.price}" data-discount="${result.discount_percent || 0}">
                        ${isBest ? '<span class="best-badge">💰 BEST PRICE</span>' : ''}
                        <div class="store-name">${result.store_name}</div>
                        <div class="product-name">
                            ${result.product_name}
                            ${result.is_tester ? '<span class="tester-badge">TESTER</span>' : ''}
                        </div>
                        <div class="price-row">
                            <span class="current-price">$${result.price.toFixed(2)}</span>
                            ${result.original_price ? `<span class="original-price">$${result.original_price.toFixed(2)}</span>` : ''}
                            ${result.discount_percent ? `<span class="discount-badge">-${result.discount_percent}%</span>` : ''}
                        </div>
                        ${result.size ? `<div class="size-info">📦 ${result.size}</div>` : ''}
                        <a href="${result.product_url}" target="_blank" rel="noopener" class="buy-button">
                            View on ${result.store_name} →
                        </a>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

            // Store results for sorting
            window.currentResults = data.results;
        }

        function sortResults(sortBy) {
            if (!window.currentResults) return;

            let sorted = [...window.currentResults];

            switch(sortBy) {
                case 'price-asc':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                case 'discount':
                    sorted.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
                    break;
            }

            displayResults({ results: sorted, stores_with_results: window.currentResults.length });
        }
    </script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main search interface"""
    return HTML_TEMPLATE


@app.get("/api/v1/search")
async def search_perfumes(
    q: str = Query(..., min_length=2, description="Search term"),
):
    """Search for perfume prices across all stores"""
    logger.info(f"Searching for: {q}")
    result = await search_all_stores(q)
    return result


@app.get("/api/v1/stores")
async def list_stores():
    """List all monitored stores"""
    return {
        "stores": [
            {
                "name": s["name"],
                "slug": s["slug"],
                "url": s["base_url"],
                "discount_range": s["discount_range"]
            }
            for s in STORES
        ],
        "total": len(STORES)
    }


@app.get("/api/v1/brands")
async def list_brands():
    """List all niche brands tracked"""
    brands = [
        "Amouage", "Boadicea the Victorious", "Bond No. 9", "Byredo",
        "Clive Christian", "Creed", "Diptyque", "Frederic Malle",
        "Initio", "Kilian", "Le Labo", "Maison Francis Kurkdjian",
        "Mancera", "Memo Paris", "Montale", "Nishane", "Ormonde Jayne",
        "Parfums de Marly", "Penhaligon's", "Roja Parfums", "Serge Lutens",
        "Tiziana Terenzi", "Tom Ford Private Blend", "Xerjoff",
        "Acqua di Parma", "House of Oud", "Nasomatto", "Orto Parisi", "BDK Parfums"
    ]
    return {"brands": brands, "total": len(brands)}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
