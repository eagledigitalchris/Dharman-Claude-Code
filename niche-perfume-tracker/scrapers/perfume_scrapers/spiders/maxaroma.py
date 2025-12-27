"""
MaxAroma Spider - Scraper para maxaroma.com
"""
import json
from urllib.parse import urljoin
from datetime import datetime

import scrapy

from .base_spider import BasePerfumeSpider


class MaxAromaSpider(BasePerfumeSpider):
    """Spider para coletar dados do MaxAroma"""

    name = "maxaroma"
    store_name = "MaxAroma"
    store_slug = "maxaroma"
    allowed_domains = ["maxaroma.com"]

    BASE_URL = "https://www.maxaroma.com"

    # Marcas de nicho disponíveis no MaxAroma
    BRAND_URLS = [
        "/brands/creed/",
        "/brands/parfums-de-marly/",
        "/brands/initio/",
        "/brands/xerjoff/",
        "/brands/maison-francis-kurkdjian/",
        "/brands/amouage/",
        "/brands/byredo/",
        "/brands/tom-ford/",
        "/brands/kilian/",
        "/brands/montale/",
        "/brands/mancera/",
        "/brands/nishane/",
        "/brands/tiziana-terenzi/",
        "/brands/roja-parfums/",
        "/brands/bond-no-9/",
        "/brands/nasomatto/",
        "/brands/orto-parisi/",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 4,
        'DOWNLOAD_DELAY': 2.5,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
    }

    def start_requests(self):
        """Inicia requisições para cada marca"""
        for brand_url in self.BRAND_URLS:
            yield scrapy.Request(
                url=urljoin(self.BASE_URL, brand_url),
                callback=self.parse,
                headers={'User-Agent': self.get_random_user_agent()},
            )

    def parse(self, response):
        """Parse da página de listagem"""
        self.logger.info(f"Parsing brand page: {response.url}")

        # Produtos na listagem
        products = response.css('div.product-item, div.product-card, article.product')

        for product in products:
            link = product.css('a.product-link::attr(href), a::attr(href)').get()
            if link:
                yield scrapy.Request(
                    url=urljoin(response.url, link),
                    callback=self.parse_product,
                    headers={'User-Agent': self.get_random_user_agent()},
                )

        # Paginação
        next_page = response.css('a.next::attr(href), a[rel="next"]::attr(href)').get()
        if next_page:
            yield scrapy.Request(
                url=urljoin(response.url, next_page),
                callback=self.parse,
            )

    def parse_product(self, response):
        """Parse da página de produto"""
        self.logger.info(f"Parsing product: {response.url}")

        # Dados básicos
        name = response.css('h1.product-title::text, h1::text').get()
        brand = response.css('.brand-name::text, a.brand::text, span.brand::text').get()

        # Tentar extrair de breadcrumb se não encontrar
        if not brand:
            brand = response.css('nav.breadcrumb li:nth-child(2) a::text').get()

        # Preços
        price_text = response.css('.price::text, .special-price::text, span.price::text').get()
        original_text = response.css('.old-price::text, .regular-price::text').get()

        price = self.clean_price(price_text)
        original_price = self.clean_price(original_text)

        if not price or not name:
            return

        # Extrair tamanho
        size_text = response.css('.product-size::text, .size::text').get() or name or ''
        size_info = self.extract_size(size_text)

        # Verificar múltiplas variantes (tamanhos)
        variants = response.css('select.size-select option, div.size-option')

        if variants:
            for variant in variants:
                variant_text = variant.css('::text').get() or ''
                variant_price = variant.css('::attr(data-price)').get()

                if variant_price:
                    v_price = self.clean_price(variant_price)
                else:
                    v_price = price

                v_size = self.extract_size(variant_text)

                yield self._create_item(
                    response=response,
                    name=name,
                    brand=brand,
                    price=float(v_price) if v_price else float(price),
                    original_price=float(original_price) if original_price else None,
                    size_info=v_size if v_size.get('size_ml') else size_info
                )
        else:
            yield self._create_item(
                response=response,
                name=name,
                brand=brand,
                price=float(price),
                original_price=float(original_price) if original_price else None,
                size_info=size_info
            )

    def _create_item(self, response, name, brand, price, original_price, size_info):
        """Cria item de perfume"""
        full_text = name or ''

        image_url = response.css('img.product-image::attr(src), img.main-image::attr(src)').get()
        sku = response.css('[itemprop="sku"]::text, .sku-value::text').get()
        stock_text = response.css('.stock-status::text, .availability::text').get() or ''

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
            'price': price,
            'original_price': original_price,
            'currency': 'USD',
            'stock_status': self.get_stock_status(stock_text),
            'in_stock': 'out of stock' not in stock_text.lower(),
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

        # Preço por ml
        if item['size_ml'] and item['size_ml'] > 0:
            item['price_per_ml'] = round(item['price'] / item['size_ml'], 4)

        return item
