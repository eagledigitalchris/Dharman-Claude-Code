"""
Niche Perfume Price Tracker - API Principal
"""
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Schemas
class PriceResponse(BaseModel):
    store_name: str
    store_slug: str
    price: float
    original_price: Optional[float] = None
    discount_percent: Optional[float] = None
    price_per_ml: Optional[float] = None
    stock_status: str
    product_url: str
    size_ml: Optional[int] = None
    is_tester: bool = False
    scraped_at: datetime


class DealResponse(BaseModel):
    id: int
    perfume_id: int
    brand: str
    name: str
    size_ml: int
    original_price: float
    current_price: float
    discount_percent: float
    deal_type: str
    deal_score: int
    badge: str
    store_name: str
    product_url: str
    detected_at: datetime


# App
app = FastAPI(
    title="Niche Perfume Price Tracker API",
    description="API para comparação de preços de perfumes de nicho",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Niche Perfume Price Tracker",
        "version": "1.0.0",
    }


@app.get("/api/v1/search")
async def search_perfumes(
    q: str = Query(..., min_length=2, description="Termo de busca"),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    in_stock_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
):
    """Busca perfumes por nome ou marca"""
    # Implementar busca real no banco
    return {
        "results": [],
        "total": 0,
        "query": q,
    }


@app.get("/api/v1/perfumes/{perfume_id}")
async def get_perfume_details(perfume_id: int):
    """Retorna detalhes de um perfume com todos os preços"""
    return {
        "id": perfume_id,
        "prices": [],
    }


@app.get("/api/v1/deals")
async def get_best_deals(
    min_discount: float = Query(20, ge=0, le=100),
    min_score: int = Query(60, ge=0, le=100),
    deal_type: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
):
    """Retorna as melhores promoções detectadas automaticamente"""
    return {
        "deals": [],
        "total": 0,
        "generated_at": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/deals/flash-sales")
async def get_flash_sales(limit: int = Query(10)):
    """Retorna flash sales (descontos > 50%)"""
    return {"flash_sales": [], "count": 0}


@app.get("/api/v1/deals/historical-lows")
async def get_historical_lows(limit: int = Query(20)):
    """Retorna perfumes no menor preço histórico"""
    return {"historical_lows": [], "count": 0}


@app.get("/api/v1/stores")
async def list_stores():
    """Lista todas as lojas monitoradas"""
    stores = [
        {"name": "FragranceX", "slug": "fragrancex", "url": "https://fragrancex.com"},
        {"name": "FragranceNet", "slug": "fragrancenet", "url": "https://fragrancenet.com"},
        {"name": "MaxAroma", "slug": "maxaroma", "url": "https://maxaroma.com"},
        {"name": "Jomashop", "slug": "jomashop", "url": "https://jomashop.com"},
        {"name": "Venba Fragrance", "slug": "venba", "url": "https://venbafragrance.com"},
        {"name": "Olfactory Factory", "slug": "olfactory", "url": "https://olfactoryfactoryllc.com"},
        {"name": "FragranceBuy", "slug": "fragrancebuy", "url": "https://fragrancebuy.ca"},
        {"name": "Aura Fragrances", "slug": "aurafragrances", "url": "https://aurafragrances.com"},
        {"name": "Niche Gallery", "slug": "nichegallery", "url": "https://nichegallerie.com"},
        {"name": "Perfume Online", "slug": "perfumeonline", "url": "https://perfumeonline.ca"},
    ]
    return {"stores": stores, "total": len(stores)}


@app.get("/api/v1/brands")
async def list_brands():
    """Lista todas as marcas de nicho"""
    brands = [
        "Amouage", "Creed", "Parfums de Marly", "Initio", "Xerjoff",
        "Maison Francis Kurkdjian", "Byredo", "Le Labo", "Tom Ford Private Blend",
        "Kilian", "Roja Parfums", "Nishane", "Tiziana Terenzi", "Montale", "Mancera"
    ]
    return {"brands": brands, "total": len(brands)}


@app.post("/api/v1/alerts")
async def create_alert(perfume_id: int, target_price: float, email: str):
    """Cria alerta de preço"""
    return {
        "status": "created",
        "perfume_id": perfume_id,
        "target_price": target_price,
        "email": email,
    }


@app.post("/api/v1/deals/subscribe")
async def subscribe_to_deals(email: str, min_score: int = 70):
    """Inscreve para receber alertas de promoções"""
    return {
        "status": "subscribed",
        "email": email,
        "min_score": min_score,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
