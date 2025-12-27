"""
Base Spider - Classe base para todos os scrapers
"""
import re
import logging
from abc import abstractmethod
from typing import Dict, Optional
from decimal import Decimal
from datetime import datetime

import scrapy
from scrapy.http import Response
from fake_useragent import UserAgent


class BasePerfumeSpider(scrapy.Spider):
    """Spider base com funcionalidades comuns"""

    name = "base_perfume"
    store_name = "Base Store"
    store_slug = "base-store"

    NICHE_BRANDS = [
        "Amouage", "Bond No. 9", "Byredo", "Clive Christian", "Creed",
        "Frederic Malle", "Initio", "Kilian", "Le Labo", "Maison Francis Kurkdjian",
        "Mancera", "Montale", "Nishane", "Parfums de Marly", "Penhaligon's",
        "Roja Parfums", "Tiziana Terenzi", "Tom Ford Private Blend", "Xerjoff",
        "Acqua di Parma", "House of Oud", "Nasomatto", "Orto Parisi", "BDK Parfums",
        "Memo Paris", "Diptyque", "Serge Lutens", "Ormonde Jayne", "Boadicea the Victorious"
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 8,
        'DOWNLOAD_DELAY': 2,
        'RANDOMIZE_DOWNLOAD_DELAY': True,
        'RETRY_TIMES': 3,
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ua = UserAgent()
        self.logger = logging.getLogger(self.name)

    def get_random_user_agent(self) -> str:
        """Retorna um user agent aleatório"""
        return self.ua.random

    def is_niche_brand(self, brand_name: str) -> bool:
        """Verifica se a marca é de nicho"""
        if not brand_name:
            return False
        brand_lower = brand_name.lower()
        for niche in self.NICHE_BRANDS:
            if niche.lower() in brand_lower:
                return True
        return False

    def clean_price(self, price_str: str) -> Optional[Decimal]:
        """Limpa e converte string de preço para Decimal"""
        if not price_str:
            return None
        try:
            cleaned = re.sub(r'[^\d.,]', '', price_str.strip())
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
            return Decimal(cleaned)
        except Exception:
            return None

    def extract_size(self, text: str) -> Dict:
        """Extrai tamanho (ml/oz) e se é tester do texto"""
        result = {'size_ml': None, 'size_oz': None, 'is_tester': False}
        if not text:
            return result

        text_lower = text.lower()
        result['is_tester'] = 'tester' in text_lower or 'unbox' in text_lower

        # Extrair ml
        ml_match = re.search(r'(\d+(?:\.\d+)?)\s*ml', text_lower)
        if ml_match:
            result['size_ml'] = int(float(ml_match.group(1)))

        # Extrair oz
        oz_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:fl\.?\s*)?oz', text_lower)
        if oz_match:
            result['size_oz'] = float(oz_match.group(1))
            if not result['size_ml']:
                # Converter oz para ml (1 oz = 29.5735 ml)
                result['size_ml'] = int(float(oz_match.group(1)) * 29.5735)

        return result

    def extract_concentration(self, text: str) -> str:
        """Extrai tipo de concentração do texto"""
        if not text:
            return "EDP"
        text_lower = text.lower()
        if 'extrait' in text_lower:
            return 'EXTRAIT'
        if 'parfum' in text_lower and 'eau' not in text_lower:
            return 'PARFUM'
        if 'eau de parfum' in text_lower or 'edp' in text_lower:
            return 'EDP'
        if 'eau de toilette' in text_lower or 'edt' in text_lower:
            return 'EDT'
        if 'cologne' in text_lower or 'edc' in text_lower:
            return 'EDC'
        return 'EDP'

    def extract_gender(self, text: str) -> str:
        """Extrai gênero do perfume"""
        if not text:
            return "unisex"
        text_lower = text.lower()
        if 'women' in text_lower or 'femme' in text_lower or 'her' in text_lower:
            return 'women'
        if 'men' in text_lower or 'homme' in text_lower or 'him' in text_lower:
            return 'men'
        return 'unisex'

    def get_stock_status(self, text: str) -> str:
        """Determina status de estoque"""
        if not text:
            return 'unknown'
        text_lower = text.lower()
        if 'out of stock' in text_lower or 'sold out' in text_lower:
            return 'out_of_stock'
        if 'low stock' in text_lower or 'few left' in text_lower:
            return 'low_stock'
        if 'in stock' in text_lower or 'available' in text_lower:
            return 'in_stock'
        return 'in_stock'

    @abstractmethod
    def parse(self, response: Response):
        """Parser principal - deve ser implementado por cada spider"""
        pass

    @abstractmethod
    def parse_product(self, response: Response):
        """Parser de produto - deve ser implementado por cada spider"""
        pass
