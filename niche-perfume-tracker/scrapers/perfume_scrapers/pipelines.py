"""
Scrapy Pipelines - Processa e salva os dados coletados
"""
import logging
from datetime import datetime
from decimal import Decimal
import json
import re

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """Valida e limpa os dados coletados"""

    REQUIRED_FIELDS = ['brand', 'name', 'price', 'product_url', 'store_name']

    def process_item(self, item, spider):
        # Verificar campos obrigatórios
        for field in self.REQUIRED_FIELDS:
            if not item.get(field):
                logger.warning(f"Missing required field '{field}' for item: {item.get('product_url')}")
                raise DropItem(f"Missing {field}")

        # Validar preço
        if item.get('price') and item['price'] <= 0:
            raise DropItem(f"Invalid price: {item['price']}")

        # Calcular desconto se não existir
        if item.get('original_price') and item.get('price'):
            if item['original_price'] > item['price']:
                discount = ((item['original_price'] - item['price']) / item['original_price']) * 100
                item['discount_percent'] = round(discount, 2)

        # Calcular preço por ml
        if item.get('price') and item.get('size_ml') and item['size_ml'] > 0:
            item['price_per_ml'] = round(item['price'] / item['size_ml'], 4)

        # Timestamp
        if not item.get('scraped_at'):
            item['scraped_at'] = datetime.utcnow().isoformat()

        return item


class NicheBrandFilterPipeline:
    """Filtra apenas perfumes de marcas de nicho"""

    NICHE_BRANDS = [
        "amouage", "bond no. 9", "byredo", "clive christian", "creed",
        "diptyque", "frederic malle", "initio", "kilian", "le labo",
        "maison francis kurkdjian", "mfk", "mancera", "memo paris", "montale",
        "nishane", "ormonde jayne", "parfums de marly", "pdm", "penhaligon",
        "roja parfums", "roja", "serge lutens", "tiziana terenzi",
        "tom ford private blend", "tom ford", "xerjoff", "acqua di parma",
        "house of oud", "nasomatto", "orto parisi", "bdk parfums", "boadicea"
    ]

    def process_item(self, item, spider):
        brand = item.get('brand', '').lower()

        is_niche = any(niche in brand for niche in self.NICHE_BRANDS)
        item['is_niche'] = is_niche

        # Se configurado para filtrar apenas nicho
        if spider.settings.getbool('FILTER_NICHE_ONLY', False) and not is_niche:
            raise DropItem(f"Not a niche brand: {item.get('brand')}")

        return item


class DuplicatesPipeline:
    """Remove itens duplicados"""

    def __init__(self):
        self.seen_urls = set()

    def process_item(self, item, spider):
        url = item.get('product_url')
        if url in self.seen_urls:
            raise DropItem(f"Duplicate item: {url}")
        self.seen_urls.add(url)
        return item


class JsonExportPipeline:
    """Exporta dados para JSON (para debug/backup)"""

    def open_spider(self, spider):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'data/scraped_{spider.name}_{timestamp}.json'
        self.file = open(filename, 'w', encoding='utf-8')
        self.items = []

    def close_spider(self, spider):
        json.dump(self.items, self.file, indent=2, ensure_ascii=False)
        self.file.close()
        logger.info(f"Exported {len(self.items)} items to JSON")

    def process_item(self, item, spider):
        self.items.append(dict(item))
        return item


class DatabasePipeline:
    """Salva dados no PostgreSQL"""

    def __init__(self, database_url):
        self.database_url = database_url
        self.connection = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            database_url=crawler.settings.get('DATABASE_URL')
        )

    def open_spider(self, spider):
        # Conectar ao banco
        # self.connection = create_connection(self.database_url)
        logger.info("Database pipeline opened")

    def close_spider(self, spider):
        if self.connection:
            self.connection.close()
        logger.info("Database pipeline closed")

    def process_item(self, item, spider):
        # Implementar inserção no banco
        # Upsert de marca, perfume, variante e preço
        logger.debug(f"Would save to database: {item.get('brand')} - {item.get('name')}")
        return item


class DropItem(Exception):
    """Exceção para dropar items inválidos"""
    pass
