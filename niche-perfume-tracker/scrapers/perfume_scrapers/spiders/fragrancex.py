"""
FragranceX Spider - Scraper para fragrancex.com
"""
import json
from urllib.parse import urljoin
from datetime import datetime

import scrapy
from scrapy.loader import ItemLoader

from .base_spider import BasePerfumeSpider
from ..items import PerfumeItem


class FragranceXSpider(BasePerfumeSpider):
    """Spider para coletar dados do FragranceX"""

    name = "fragrancex"
    store_name = "FragranceX"
    store_slug = "fragrancex"
    allowed_domains = ["fragrancex.com"]

    BASE_URL = "https://www.fragrancex.com"

    # URLs das marcas de nicho
    BRAND_URLS = [
        "/Creed-perfume-cologne/",
        "/Parfums-de-Marly-perfume-cologne/",
        "/Initio-perfume-cologne/",
        "/Xerjoff-perfume-cologne/",
        "/Maison-Francis-Kurkdjian-perfume-cologne/",
        "/Amouage-perfume-cologne/",
        "/Byredo-perfume-cologne/",
        "/Le-Labo-perfume-cologne/",
        "/Tom-Ford-perfume-cologne/",
        "/Kilian-perfume-cologne/",
        "/Montale-perfume-cologne/",
        "/Mancera-perfume-cologne/",
        "/Nishane-perfume-cologne/",
        "/Tiziana-Terenzi-perfume-cologne/",
        "/Roja-Parfums-perfume-cologne/",
        "/Bond-No-9-perfume-cologne/",
        "/Clive-Christian-perfume-cologne/",
        "/Frederic-Malle-perfume-cologne/",
        "/Serge-Lutens-perfume-cologne/",
        "/Penhaligons-perfume-cologne/",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 4,
        'DOWNLOAD_DELAY': 3,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
    }

    def start_requests(self):
        """Inicia requisições para cada marca"""
        for brand_url in self.BRAND_URLS:
            yield scrapy.Request(
                url=urljoin(self.BASE_URL, brand_url),
                callback=self.parse,
                headers={'User-Agent': self.get_random_user_agent()},
                meta={'brand_url': brand_url}
            )

    def parse(self, response):
        """Parse da página de listagem de produtos"""
        self.logger.info(f"Parsing brand page: {response.url}")

        # Selecionar cards de produtos
        products = response.css('div.product-card, div.product-item, div.product')

        for product in products:
            link = product.css('a::attr(href)').get()
            if link:
                yield scrapy.Request(
                    url=urljoin(response.url, link),
                    callback=self.parse_product,
                    headers={'User-Agent': self.get_random_user_agent()},
                )

        # Paginação
        next_page = response.css('a.next-page::attr(href), a[rel="next"]::attr(href), li.next a::attr(href)').get()
        if next_page:
            yield scrapy.Request(
                url=urljoin(response.url, next_page),
                callback=self.parse,
                headers={'User-Agent': self.get_random_user_agent()},
            )

    def parse_product(self, response):
        """Parse da página de produto individual"""
        self.logger.info(f"Parsing product: {response.url}")

        # Extrair dados do produto
        name = response.css('h1::text, h1.product-title::text').get()
        brand = response.css('.brand-name::text, a.brand-link::text, span.brand::text').get()

        # Preços
        price_text = response.css('.price::text, .sale-price::text, span.current-price::text').get()
        original_text = response.css('.original-price::text, .was-price::text, span.list-price::text').get()

        price = self.clean_price(price_text)
        original_price = self.clean_price(original_text)

        if not price or not name:
            self.logger.warning(f"Missing price or name for {response.url}")
            return

        # Extrair informações do nome/descrição
        full_text = name or ''
        size_info = self.extract_size(full_text)

        # Imagem
        image_url = response.css('img.product-image::attr(src), img.main-image::attr(src)').get()

        # SKU
        sku = response.css('span.sku::text, [itemprop="sku"]::text').get()

        # Stock status
        stock_text = response.css('.stock-status::text, .availability::text').get() or ''
        stock_status = self.get_stock_status(stock_text)

        # Criar item
        item = {
            'store_name': self.store_name,
            'store_slug': self.store_slug,
            'store_sku': sku.strip() if sku else None,
            'brand': brand.strip() if brand else '',
            'name': name.strip() if name else '',
            'full_name': full_text.strip(),
            'size_ml': size_info.get('size_ml'),
            'size_oz': size_info.get('size_oz'),
            'is_tester': size_info.get('is_tester', False),
            'concentration': self.extract_concentration(full_text),
            'gender': self.extract_gender(full_text),
            'price': float(price),
            'original_price': float(original_price) if original_price else None,
            'currency': 'USD',
            'stock_status': stock_status,
            'in_stock': stock_status != 'out_of_stock',
            'product_url': response.url,
            'image_url': urljoin(response.url, image_url) if image_url else None,
            'is_niche': self.is_niche_brand(brand),
            'scraped_at': datetime.utcnow().isoformat(),
        }

        # Calcular desconto
        if item['original_price'] and item['original_price'] > item['price']:
            item['discount_percent'] = round(
                ((item['original_price'] - item['price']) / item['original_price']) * 100, 2
            )

        # Calcular preço por ml
        if item['size_ml'] and item['size_ml'] > 0:
            item['price_per_ml'] = round(item['price'] / item['size_ml'], 4)

        yield item
