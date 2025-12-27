"""
Scrapy Items - Define os dados coletados pelos spiders
"""
import scrapy
from scrapy.loader.processors import TakeFirst, MapCompose, Join
from datetime import datetime


def clean_price(value):
    """Remove símbolos de moeda e espaços"""
    if value:
        import re
        cleaned = re.sub(r'[^\d.,]', '', str(value).strip())
        if cleaned:
            try:
                # Handle comma as decimal separator
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
                return float(cleaned)
            except ValueError:
                return None
    return None


def clean_text(value):
    """Remove espaços extras e caracteres especiais"""
    if value:
        return ' '.join(str(value).split()).strip()
    return None


class PerfumeItem(scrapy.Item):
    """Item principal para dados de perfume"""

    # Identificação
    store_name = scrapy.Field(output_processor=TakeFirst())
    store_slug = scrapy.Field(output_processor=TakeFirst())
    store_sku = scrapy.Field(output_processor=TakeFirst())

    # Produto
    brand = scrapy.Field(
        input_processor=MapCompose(clean_text),
        output_processor=TakeFirst()
    )
    name = scrapy.Field(
        input_processor=MapCompose(clean_text),
        output_processor=TakeFirst()
    )
    full_name = scrapy.Field(
        input_processor=MapCompose(clean_text),
        output_processor=TakeFirst()
    )

    # Variante
    size_ml = scrapy.Field(output_processor=TakeFirst())
    size_oz = scrapy.Field(output_processor=TakeFirst())
    concentration = scrapy.Field(output_processor=TakeFirst())
    gender = scrapy.Field(output_processor=TakeFirst())
    is_tester = scrapy.Field(output_processor=TakeFirst())

    # Preços
    price = scrapy.Field(
        input_processor=MapCompose(clean_price),
        output_processor=TakeFirst()
    )
    original_price = scrapy.Field(
        input_processor=MapCompose(clean_price),
        output_processor=TakeFirst()
    )
    discount_percent = scrapy.Field(output_processor=TakeFirst())
    price_per_ml = scrapy.Field(output_processor=TakeFirst())
    currency = scrapy.Field(output_processor=TakeFirst())

    # Disponibilidade
    stock_status = scrapy.Field(output_processor=TakeFirst())
    in_stock = scrapy.Field(output_processor=TakeFirst())

    # URLs e imagens
    product_url = scrapy.Field(output_processor=TakeFirst())
    image_url = scrapy.Field(output_processor=TakeFirst())

    # Classificação
    is_niche = scrapy.Field(output_processor=TakeFirst())

    # Metadados
    scraped_at = scrapy.Field(output_processor=TakeFirst())


class PriceItem(scrapy.Item):
    """Item para histórico de preços"""

    perfume_id = scrapy.Field()
    variant_id = scrapy.Field()
    store_id = scrapy.Field()
    price = scrapy.Field()
    currency = scrapy.Field()
    stock_status = scrapy.Field()
    product_url = scrapy.Field()
    scraped_at = scrapy.Field()
