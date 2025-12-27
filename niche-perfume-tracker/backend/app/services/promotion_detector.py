"""
Promotion Detector - Detecta promoções excepcionais automaticamente
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class Deal:
    perfume_id: int
    variant_id: int
    store_id: int
    brand: str
    name: str
    size_ml: int
    current_price: Decimal
    original_price: Decimal
    discount_percent: float
    historical_low: Decimal
    avg_price_30d: Decimal
    deal_type: str
    deal_score: int
    badge: str
    product_url: str


class PromotionDetector:
    """Detecta e classifica promoções de perfumes"""

    # Thresholds para classificação de deals
    FLASH_SALE_MIN_DISCOUNT = 50
    HOT_DEAL_MIN_DISCOUNT = 35
    GOOD_DEAL_MIN_DISCOUNT = 25

    # Pesos para cálculo do deal score
    WEIGHT_DISCOUNT = 0.35
    WEIGHT_VS_HISTORICAL = 0.30
    WEIGHT_VS_AVG = 0.20
    WEIGHT_BRAND_POPULARITY = 0.15

    # Marcas mais populares (maior peso no score)
    POPULAR_BRANDS = [
        "Creed", "Parfums de Marly", "Initio", "Maison Francis Kurkdjian",
        "Tom Ford Private Blend", "Xerjoff", "Kilian", "Amouage"
    ]

    def __init__(self, db_session=None):
        self.db = db_session

    def calculate_deal_score(
        self,
        discount_percent: float,
        current_price: Decimal,
        historical_low: Decimal,
        avg_price_30d: Decimal,
        brand: str
    ) -> int:
        """
        Calcula um score de 0-100 para a qualidade do deal
        """
        # Score do desconto (0-100)
        discount_score = min(discount_percent * 2, 100)

        # Score vs histórico (0-100)
        if historical_low and historical_low > 0:
            vs_historical = ((historical_low - current_price) / historical_low) * 100
            historical_score = max(min(vs_historical * 2 + 50, 100), 0)
        else:
            historical_score = 50

        # Score vs média 30 dias (0-100)
        if avg_price_30d and avg_price_30d > 0:
            vs_avg = ((avg_price_30d - current_price) / avg_price_30d) * 100
            avg_score = max(min(vs_avg * 2 + 50, 100), 0)
        else:
            avg_score = 50

        # Score da marca (0-100)
        brand_score = 80 if brand in self.POPULAR_BRANDS else 50

        # Calcular score final ponderado
        final_score = (
            discount_score * self.WEIGHT_DISCOUNT +
            historical_score * self.WEIGHT_VS_HISTORICAL +
            avg_score * self.WEIGHT_VS_AVG +
            brand_score * self.WEIGHT_BRAND_POPULARITY
        )

        return int(final_score)

    def classify_deal(self, discount_percent: float, deal_score: int) -> Tuple[str, str]:
        """
        Classifica o tipo de deal e retorna badge apropriado
        Returns: (deal_type, badge)
        """
        if discount_percent >= self.FLASH_SALE_MIN_DISCOUNT:
            return ("flash_sale", "FLASH SALE")
        elif deal_score >= 85:
            return ("exceptional", "EXCEPTIONAL DEAL")
        elif discount_percent >= self.HOT_DEAL_MIN_DISCOUNT or deal_score >= 70:
            return ("hot", "HOT DEAL")
        elif discount_percent >= self.GOOD_DEAL_MIN_DISCOUNT or deal_score >= 55:
            return ("good", "GOOD DEAL")
        else:
            return ("regular", "DEAL")

    def detect_deals(
        self,
        min_discount: float = 20,
        min_score: int = 50,
        limit: int = 50
    ) -> List[Deal]:
        """
        Detecta as melhores promoções atuais
        """
        deals = []

        # Aqui seria implementada a lógica real de busca no banco
        # Por enquanto retorna lista vazia

        logger.info(f"Detected {len(deals)} deals with min_discount={min_discount}, min_score={min_score}")
        return deals

    def detect_flash_sales(self, limit: int = 10) -> List[Deal]:
        """Detecta flash sales (> 50% desconto)"""
        return self.detect_deals(
            min_discount=self.FLASH_SALE_MIN_DISCOUNT,
            min_score=0,
            limit=limit
        )

    def detect_historical_lows(self, limit: int = 20) -> List[Deal]:
        """
        Detecta perfumes que estão no menor preço histórico
        """
        historical_lows = []

        # Implementar busca de preços históricos

        logger.info(f"Found {len(historical_lows)} products at historical low prices")
        return historical_lows

    def get_deal_summary(self) -> Dict:
        """
        Retorna resumo das promoções atuais
        """
        flash_sales = self.detect_flash_sales(limit=5)
        hot_deals = self.detect_deals(min_discount=35, min_score=70, limit=10)
        historical_lows = self.detect_historical_lows(limit=5)

        return {
            "flash_sales": len(flash_sales),
            "hot_deals": len(hot_deals),
            "historical_lows": len(historical_lows),
            "total_active_deals": len(flash_sales) + len(hot_deals),
            "generated_at": datetime.utcnow().isoformat()
        }
