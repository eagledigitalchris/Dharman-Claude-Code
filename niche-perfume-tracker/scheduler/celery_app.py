"""
Celery App - Scheduler para tarefas de scraping
"""
import os
from celery import Celery
from celery.schedules import crontab
from datetime import timedelta

# Configuração do broker
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/1')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')

# Criar app Celery
app = Celery(
    'perfume_tracker',
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=['scheduler.tasks']
)

# Configurações
app.conf.update(
    # Timezone
    timezone='UTC',
    enable_utc=True,

    # Serialização
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # Resultados
    result_expires=3600,  # 1 hora

    # Worker
    worker_prefetch_multiplier=1,
    worker_concurrency=4,

    # Task
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=3600,  # 1 hora
    task_soft_time_limit=3300,  # 55 minutos

    # Retry
    task_default_retry_delay=60,
    task_max_retries=3,
)

# Schedule de tarefas periódicas
app.conf.beat_schedule = {
    # Scraping a cada 6 horas
    'scrape-all-sites-every-6-hours': {
        'task': 'scheduler.tasks.run_all_spiders',
        'schedule': timedelta(hours=6),
        'options': {'queue': 'scraping'}
    },

    # Detectar promoções a cada 2 horas
    'detect-promotions-every-2-hours': {
        'task': 'scheduler.tasks.detect_promotions',
        'schedule': timedelta(hours=2),
        'options': {'queue': 'default'}
    },

    # Verificar alertas de preço a cada 30 minutos
    'check-price-alerts-every-30-min': {
        'task': 'scheduler.tasks.check_price_alerts',
        'schedule': timedelta(minutes=30),
        'options': {'queue': 'alerts'}
    },

    # Enviar digest diário às 9h UTC
    'daily-deals-digest-9am': {
        'task': 'scheduler.tasks.send_daily_digest',
        'schedule': crontab(hour=9, minute=0),
        'options': {'queue': 'email'}
    },

    # Limpeza de dados antigos (semanal, domingo 3h)
    'cleanup-old-data-weekly': {
        'task': 'scheduler.tasks.cleanup_old_data',
        'schedule': crontab(hour=3, minute=0, day_of_week='sunday'),
        'options': {'queue': 'maintenance'}
    },

    # Atualizar estatísticas de marca (diário, meia-noite)
    'update-brand-stats-daily': {
        'task': 'scheduler.tasks.update_brand_statistics',
        'schedule': crontab(hour=0, minute=0),
        'options': {'queue': 'default'}
    },
}

# Roteamento de filas
app.conf.task_routes = {
    'scheduler.tasks.run_spider': {'queue': 'scraping'},
    'scheduler.tasks.run_all_spiders': {'queue': 'scraping'},
    'scheduler.tasks.detect_promotions': {'queue': 'default'},
    'scheduler.tasks.check_price_alerts': {'queue': 'alerts'},
    'scheduler.tasks.send_daily_digest': {'queue': 'email'},
    'scheduler.tasks.send_alert_email': {'queue': 'email'},
}


if __name__ == '__main__':
    app.start()
