/**
 * Deals Page - Página de promoções de perfumes de nicho
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Types
interface Deal {
  id: number;
  perfume_id: number;
  brand: string;
  name: string;
  size_ml: number;
  original_price: number;
  current_price: number;
  discount_percent: number;
  deal_type: 'flash_sale' | 'exceptional' | 'hot' | 'good' | 'regular';
  deal_score: number;
  badge: string;
  store_name: string;
  product_url: string;
  image_url?: string;
  detected_at: string;
}

interface DealsResponse {
  deals: Deal[];
  total: number;
  generated_at: string;
}

// Badge colors by deal type
const badgeColors: Record<string, string> = {
  flash_sale: 'bg-red-500 text-white animate-pulse',
  exceptional: 'bg-purple-600 text-white',
  hot: 'bg-orange-500 text-white',
  good: 'bg-green-500 text-white',
  regular: 'bg-blue-500 text-white',
};

// Deal Card Component
function DealCard({ deal }: { deal: Deal }) {
  const savings = deal.original_price - deal.current_price;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Badge */}
      <div className="relative">
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-bold ${badgeColors[deal.deal_type]}`}>
          {deal.badge}
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          Score: {deal.deal_score}
        </div>
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {deal.image_url ? (
            <img src={deal.image_url} alt={deal.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-gray-400 text-4xl">🧴</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-500 uppercase tracking-wide">{deal.brand}</p>
        <h3 className="font-semibold text-lg text-gray-900 mt-1 line-clamp-2">{deal.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{deal.size_ml}ml</p>

        {/* Prices */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">${deal.current_price.toFixed(2)}</span>
          <span className="text-lg text-gray-400 line-through">${deal.original_price.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="mt-2 flex items-center gap-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
            -{deal.discount_percent.toFixed(0)}%
          </span>
          <span className="text-sm text-gray-600">
            Save ${savings.toFixed(2)}
          </span>
        </div>

        {/* Store */}
        <p className="mt-3 text-sm text-gray-500">
          at <span className="font-medium text-gray-700">{deal.store_name}</span>
        </p>

        {/* Button */}
        <a
          href={deal.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          View Deal →
        </a>
      </div>
    </div>
  );
}

// Filter Component
function DealFilters({
  dealType,
  setDealType,
  minDiscount,
  setMinDiscount,
}: {
  dealType: string;
  setDealType: (v: string) => void;
  minDiscount: number;
  setMinDiscount: (v: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Deal Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deal Type</label>
          <select
            value={dealType}
            onChange={(e) => setDealType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Deals</option>
            <option value="flash_sale">Flash Sales (50%+)</option>
            <option value="exceptional">Exceptional</option>
            <option value="hot">Hot Deals</option>
            <option value="good">Good Deals</option>
          </select>
        </div>

        {/* Minimum Discount Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Discount: {minDiscount}%
          </label>
          <input
            type="range"
            min="0"
            max="70"
            step="5"
            value={minDiscount}
            onChange={(e) => setMinDiscount(Number(e.target.value))}
            className="w-40"
          />
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealType, setDealType] = useState('');
  const [minDiscount, setMinDiscount] = useState(20);

  useEffect(() => {
    fetchDeals();
  }, [dealType, minDiscount]);

  async function fetchDeals() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        min_discount: minDiscount.toString(),
        min_score: '50',
        limit: '24',
      });

      if (dealType) {
        params.append('deal_type', dealType);
      }

      const response = await fetch(`/api/v1/deals?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }

      const data: DealsResponse = await response.json();
      setDeals(data.deals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Best Deals - Niche Perfume Price Tracker</title>
        <meta name="description" content="Find the best deals on niche perfumes from top gray market retailers" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">🔥 Best Deals</h1>
            <p className="mt-2 text-indigo-100">
              Exceptional discounts on niche perfumes, updated every 2 hours
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <DealFilters
            dealType={dealType}
            setDealType={setDealType}
            minDiscount={minDiscount}
            setMinDiscount={setMinDiscount}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Deals Grid */}
          {!loading && !error && (
            <>
              {deals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No deals found matching your criteria</p>
                  <button
                    onClick={() => {
                      setDealType('');
                      setMinDiscount(20);
                    }}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>Niche Perfume Price Tracker - Compare prices across 10 gray market stores</p>
            <p className="mt-2 text-sm">
              Prices updated every 6 hours. Deals detected automatically.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
