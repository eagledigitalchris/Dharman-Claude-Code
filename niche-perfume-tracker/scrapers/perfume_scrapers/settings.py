"""
Scrapy Settings
"""
import os

BOT_NAME = 'perfume_scrapers'

SPIDER_MODULES = ['perfume_scrapers.spiders']
NEWSPIDER_MODULE = 'perfume_scrapers.spiders'

# Crawl responsibly
ROBOTSTXT_OBEY = True
USER_AGENT = 'NichePerfumeTracker/1.0 (+https://github.com/niche-perfume-tracker)'

# Configure concurrency
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 4
DOWNLOAD_DELAY = 2
RANDOMIZE_DOWNLOAD_DELAY = True

# Configure retries
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# Configure timeouts
DOWNLOAD_TIMEOUT = 30

# Configure cookies
COOKIES_ENABLED = True

# Configure headers
DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
}

# Enable AutoThrottle
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 2
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# Configure pipelines
ITEM_PIPELINES = {
    'perfume_scrapers.pipelines.ValidationPipeline': 100,
    'perfume_scrapers.pipelines.NicheBrandFilterPipeline': 200,
    'perfume_scrapers.pipelines.DuplicatesPipeline': 300,
    'perfume_scrapers.pipelines.JsonExportPipeline': 400,
    # 'perfume_scrapers.pipelines.DatabasePipeline': 500,
}

# Filter only niche brands
FILTER_NICHE_ONLY = False

# Database
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+asyncpg://postgres:password@localhost:5432/perfume_tracker'
)

# Redis for caching
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Enable HTTP caching
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600  # 1 hour
HTTPCACHE_DIR = 'httpcache'
HTTPCACHE_IGNORE_HTTP_CODES = [500, 502, 503, 504]

# Logging
LOG_LEVEL = 'INFO'
LOG_FORMAT = '%(asctime)s [%(name)s] %(levelname)s: %(message)s'

# Request fingerprinting
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'
FEED_EXPORT_ENCODING = 'utf-8'
