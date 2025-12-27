"""
Celery Tasks - Tarefas agendadas
"""
import subprocess
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from celery import shared_task, chain, group
from celery.exceptions import MaxRetriesExceededError

logger = logging.getLogger(__name__)

# Lista de spiders disponíveis
AVAILABLE_SPIDERS = [
    'fragrancex',
    'maxaroma',
    'fragrancenet',
    'jomashop',
    'venba',
    'olfactory',
    'fragrancebuy',
    'aurafragrances',
    'nichegallery',
    'perfumeonline',
]


@shared_task(bind=True, max_retries=3)
def run_spider(self, spider_name: str) -> Dict:
    """
    Executa um spider específico

    Args:
        spider_name: Nome do spider a executar

    Returns:
        Dict com status e estatísticas
    """
    logger.info(f"Starting spider: {spider_name}")

    try:
        result = subprocess.run(
            ['scrapy', 'crawl', spider_name, '-o', f'data/output_{spider_name}.json'],
            cwd='/app/scrapers',
            capture_output=True,
            text=True,
            timeout=3600,  # 1 hora
        )

        if result.returncode == 0:
            logger.info(f"Spider {spider_name} completed successfully")
            return {
                'status': 'success',
                'spider': spider_name,
                'completed_at': datetime.utcnow().isoformat(),
            }
        else:
            logger.error(f"Spider {spider_name} failed: {result.stderr}")
            return {
                'status': 'failed',
                'spider': spider_name,
                'error': result.stderr[:500],
            }

    except subprocess.TimeoutExpired:
        logger.error(f"Spider {spider_name} timed out")
        return {'status': 'timeout', 'spider': spider_name}

    except Exception as e:
        logger.exception(f"Spider {spider_name} exception: {e}")
        try:
            self.retry(countdown=60 * (2 ** self.request.retries))
        except MaxRetriesExceededError:
            return {'status': 'failed', 'spider': spider_name, 'error': str(e)}


@shared_task
def run_all_spiders() -> Dict:
    """
    Executa todos os spiders em paralelo

    Returns:
        Dict com lista de spiders agendados
    """
    logger.info("Starting all spiders")

    # Criar grupo de tarefas paralelas
    spider_tasks = group([run_spider.s(spider) for spider in AVAILABLE_SPIDERS])

    # Executar
    result = spider_tasks.apply_async()

    return {
        'status': 'queued',
        'spiders': AVAILABLE_SPIDERS,
        'task_id': result.id,
        'queued_at': datetime.utcnow().isoformat(),
    }


@shared_task
def detect_promotions() -> Dict:
    """
    Detecta promoções excepcionais nos dados coletados

    Returns:
        Dict com contagem de promoções detectadas
    """
    logger.info("Detecting promotions...")

    try:
        # Importar detector
        from backend.app.services.promotion_detector import PromotionDetector

        detector = PromotionDetector()

        # Detectar diferentes tipos de deals
        flash_sales = detector.detect_flash_sales(limit=20)
        hot_deals = detector.detect_deals(min_discount=35, min_score=70, limit=50)
        historical_lows = detector.detect_historical_lows(limit=30)

        total_detected = len(flash_sales) + len(hot_deals) + len(historical_lows)

        logger.info(f"Detected {total_detected} promotions")

        return {
            'status': 'success',
            'flash_sales': len(flash_sales),
            'hot_deals': len(hot_deals),
            'historical_lows': len(historical_lows),
            'total': total_detected,
            'detected_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error detecting promotions: {e}")
        return {'status': 'error', 'error': str(e)}


@shared_task
def check_price_alerts() -> Dict:
    """
    Verifica alertas de preço dos usuários

    Returns:
        Dict com contagem de alertas verificados e acionados
    """
    logger.info("Checking price alerts...")

    checked = 0
    triggered = 0

    try:
        # Implementar verificação real
        # 1. Buscar alertas ativos
        # 2. Comparar com preços atuais
        # 3. Acionar alertas que atingiram o preço alvo

        logger.info(f"Checked {checked} alerts, triggered {triggered}")

        return {
            'status': 'success',
            'checked': checked,
            'triggered': triggered,
            'checked_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error checking alerts: {e}")
        return {'status': 'error', 'error': str(e)}


@shared_task(bind=True, max_retries=3)
def send_alert_email(self, user_email: str, alert_data: Dict) -> Dict:
    """
    Envia email de alerta para usuário

    Args:
        user_email: Email do destinatário
        alert_data: Dados do alerta

    Returns:
        Dict com status do envio
    """
    logger.info(f"Sending alert email to {user_email}")

    try:
        # Implementar envio real com SendGrid
        # from sendgrid import SendGridAPIClient
        # from sendgrid.helpers.mail import Mail

        return {
            'status': 'sent',
            'email': user_email,
            'sent_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error sending email: {e}")
        try:
            self.retry(countdown=60)
        except MaxRetriesExceededError:
            return {'status': 'failed', 'error': str(e)}


@shared_task
def send_daily_digest() -> Dict:
    """
    Envia resumo diário de promoções para usuários inscritos

    Returns:
        Dict com contagem de emails enviados
    """
    logger.info("Sending daily digest...")

    sent = 0

    try:
        # 1. Buscar melhores promoções do dia
        # 2. Buscar usuários inscritos
        # 3. Enviar email para cada usuário

        logger.info(f"Sent daily digest to {sent} users")

        return {
            'status': 'success',
            'sent': sent,
            'sent_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error sending digest: {e}")
        return {'status': 'error', 'error': str(e)}


@shared_task
def cleanup_old_data() -> Dict:
    """
    Remove dados antigos do banco

    Returns:
        Dict com contagem de registros removidos
    """
    logger.info("Cleaning up old data...")

    deleted = 0

    try:
        # 1. Remover histórico de preços > 90 dias
        # 2. Remover alertas inativos > 30 dias
        # 3. Remover promoções expiradas

        logger.info(f"Deleted {deleted} old records")

        return {
            'status': 'success',
            'deleted': deleted,
            'cleaned_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error cleaning up: {e}")
        return {'status': 'error', 'error': str(e)}


@shared_task
def update_brand_statistics() -> Dict:
    """
    Atualiza estatísticas agregadas por marca

    Returns:
        Dict com contagem de marcas atualizadas
    """
    logger.info("Updating brand statistics...")

    updated = 0

    try:
        # 1. Calcular preço médio por marca
        # 2. Calcular desconto médio por marca
        # 3. Contar produtos por marca
        # 4. Identificar melhores deals por marca

        logger.info(f"Updated statistics for {updated} brands")

        return {
            'status': 'success',
            'updated': updated,
            'updated_at': datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.exception(f"Error updating stats: {e}")
        return {'status': 'error', 'error': str(e)}
