"""
Database Models - SQLAlchemy
"""
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, DateTime, Boolean,
    ForeignKey, Index, UniqueConstraint, Enum as SQLEnum
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import ARRAY
import enum

Base = declarative_base()


class ConcentrationType(enum.Enum):
    PARFUM = "Parfum"
    EDP = "Eau de Parfum"
    EDT = "Eau de Toilette"
    EDC = "Eau de Cologne"
    EXTRAIT = "Extrait de Parfum"


class StockStatus(enum.Enum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False)
    country = Column(String(100))
    is_niche = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    perfumes = relationship("Perfume", back_populates="brand")


class Perfume(Base):
    __tablename__ = "perfumes"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False, index=True)
    name = Column(String(500), nullable=False, index=True)
    slug = Column(String(500), nullable=False)
    concentration = Column(SQLEnum(ConcentrationType), default=ConcentrationType.EDP)
    gender = Column(String(50))
    image_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    brand = relationship("Brand", back_populates="perfumes")
    variants = relationship("PerfumeVariant", back_populates="perfume")
    prices = relationship("Price", back_populates="perfume")


class PerfumeVariant(Base):
    __tablename__ = "perfume_variants"

    id = Column(Integer, primary_key=True, index=True)
    perfume_id = Column(Integer, ForeignKey("perfumes.id"), nullable=False, index=True)
    size_ml = Column(Integer, nullable=False)
    size_oz = Column(Numeric(5, 2))
    is_tester = Column(Boolean, default=False)

    perfume = relationship("Perfume", back_populates="variants")
    prices = relationship("Price", back_populates="variant")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    website = Column(String(500), nullable=False)
    country = Column(String(100), default="USA")
    is_active = Column(Boolean, default=True)
    last_scraped = Column(DateTime)

    prices = relationship("Price", back_populates="store")


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    perfume_id = Column(Integer, ForeignKey("perfumes.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("perfume_variants.id"), index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)

    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    discount_percent = Column(Numeric(5, 2))
    price_per_ml = Column(Numeric(8, 4))
    currency = Column(String(10), default="USD")
    stock_status = Column(SQLEnum(StockStatus), default=StockStatus.IN_STOCK)
    product_url = Column(String(1000), nullable=False)
    store_sku = Column(String(255))
    scraped_at = Column(DateTime, default=datetime.utcnow)
    is_current = Column(Boolean, default=True)

    perfume = relationship("Perfume", back_populates="prices")
    variant = relationship("PerfumeVariant", back_populates="prices")
    store = relationship("Store", back_populates="prices")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    perfume_id = Column(Integer, ForeignKey("perfumes.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("perfume_variants.id"), index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    notification_email = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    alerts = relationship("PriceAlert", back_populates="user")


class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    perfume_id = Column(Integer, ForeignKey("perfumes.id"), nullable=False, index=True)
    target_price = Column(Numeric(10, 2), nullable=False)
    alert_type = Column(String(50), default="below")
    is_active = Column(Boolean, default=True)
    triggered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")
    perfume = relationship("Perfume")


class PromotionAlert(Base):
    __tablename__ = "promotion_alerts"

    id = Column(Integer, primary_key=True, index=True)
    perfume_id = Column(Integer, ForeignKey("perfumes.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("perfume_variants.id"), index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    current_price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    discount_percent = Column(Numeric(5, 2))
    deal_type = Column(String(50))
    deal_score = Column(Integer)
    product_url = Column(String(1000), nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    is_active = Column(Boolean, default=True)
