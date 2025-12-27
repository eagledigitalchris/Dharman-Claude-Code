# 🧴 Niche Perfume Price Tracker

Sistema de comparação de preços de perfumes de nicho em 10 sites de gray market dos EUA/Canadá.

## 📋 Funcionalidades

- **Scraping Automático**: Coleta preços de 10 lojas a cada 6 horas
- **Detecção de Promoções**: Identifica automaticamente as melhores ofertas
- **Alertas de Preço**: Notifica quando um perfume atinge o preço desejado
- **Histórico de Preços**: Acompanha a evolução dos preços ao longo do tempo
- **Deal Score**: Sistema de pontuação para classificar as melhores promoções

## 🏪 Lojas Monitoradas

| Loja | País | Desconto Típico |
|------|------|-----------------|
| FragranceX | USA | 30-50% |
| FragranceNet | USA | 35-60% |
| MaxAroma | USA | 20-40% |
| Jomashop | USA | 15-35% |
| Venba Fragrance | USA | 25-45% |
| Olfactory Factory | USA | 30-50% |
| FragranceBuy | Canada | 20-35% |
| Aura Fragrances | USA | 40-60% |
| Niche Gallery | USA | 30-70% |
| Perfume Online | Canada | 25-40% |

## 🏷️ Marcas de Nicho

Amouage, Creed, Parfums de Marly, Initio, Xerjoff, Maison Francis Kurkdjian, Byredo, Le Labo, Tom Ford Private Blend, Kilian, Roja Parfums, Nishane, Tiziana Terenzi, Montale, Mancera, e mais.

## 🚀 Quick Start

### Usando Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/niche-perfume-tracker.git
cd niche-perfume-tracker

# 2. Copie o arquivo de ambiente
cp .env.example .env

# 3. Inicie os containers
docker-compose up -d

# 4. Acesse
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Instalação Local

```bash
# 1. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Iniciar PostgreSQL e Redis (necessário)
docker-compose up -d postgres redis

# 5. Iniciar a API
cd backend
uvicorn app.main:app --reload --port 8000

# 6. Iniciar o worker Celery (em outro terminal)
celery -A scheduler.celery_app worker --loglevel=info

# 7. Iniciar o scheduler Celery Beat (em outro terminal)
celery -A scheduler.celery_app beat --loglevel=info
```

## 📡 API Endpoints

### Busca e Consulta

```
GET /api/v1/search?q=aventus          # Busca perfumes
GET /api/v1/perfumes/{id}              # Detalhes do perfume
GET /api/v1/brands                     # Lista marcas
GET /api/v1/stores                     # Lista lojas
```

### Promoções

```
GET /api/v1/deals                      # Melhores promoções
GET /api/v1/deals/flash-sales          # Flash sales (>50% off)
GET /api/v1/deals/historical-lows      # Menor preço histórico
```

### Alertas

```
POST /api/v1/alerts                    # Criar alerta de preço
POST /api/v1/deals/subscribe           # Inscrever para alertas
```

## 🔧 Tecnologias

- **Backend**: Python 3.11, FastAPI, SQLAlchemy
- **Scraping**: Scrapy, BeautifulSoup, Selenium
- **Database**: PostgreSQL, Redis
- **Task Queue**: Celery
- **Frontend**: Next.js, React, TailwindCSS
- **Containers**: Docker, Docker Compose

## 📁 Estrutura do Projeto

```
niche-perfume-tracker/
├── backend/
│   └── app/
│       ├── main.py           # API FastAPI
│       ├── models/           # Modelos SQLAlchemy
│       └── services/         # Lógica de negócio
├── scrapers/
│   └── perfume_scrapers/
│       ├── spiders/          # Spiders Scrapy
│       ├── items.py          # Definição de items
│       ├── pipelines.py      # Pipelines de processamento
│       └── settings.py       # Configurações
├── scheduler/
│   ├── celery_app.py         # Configuração Celery
│   └── tasks.py              # Tarefas agendadas
├── frontend/
│   └── src/pages/            # Páginas Next.js
├── data/
│   └── niche_brands.json     # Dados de marcas
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

## 🔄 Tarefas Agendadas

| Tarefa | Frequência | Descrição |
|--------|------------|-----------|
| Scraping | 6 horas | Coleta preços de todas as lojas |
| Promoções | 2 horas | Detecta novas promoções |
| Alertas | 30 min | Verifica alertas de preço |
| Digest | Diário 9h | Envia resumo de promoções |

## 📊 Deal Score

O sistema calcula um score de 0-100 para cada promoção baseado em:

- **35%** - Percentual de desconto
- **30%** - Comparação com menor preço histórico
- **20%** - Comparação com média dos últimos 30 dias
- **15%** - Popularidade da marca

### Classificação de Deals

| Badge | Critério |
|-------|----------|
| 🔥 FLASH SALE | Desconto ≥ 50% |
| 💎 EXCEPTIONAL | Score ≥ 85 |
| 🔥 HOT DEAL | Desconto ≥ 35% ou Score ≥ 70 |
| ✅ GOOD DEAL | Desconto ≥ 25% ou Score ≥ 55 |

## 📝 Licença

MIT License
