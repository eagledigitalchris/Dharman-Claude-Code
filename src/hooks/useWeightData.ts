import { useState, useEffect } from 'react';
import { Weight } from '../types';
import { StorageService } from '../services/storage';

export const useWeightData = (userId: string) => {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchWeights();
  }, [userId]);

  const fetchWeights = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Firebase/Supabase
      // For now, return mock data
      const mockWeights: Weight[] = [
        {
          id: '1',
          user_id: userId,
          date: new Date(2025, 2, 1),
          weight_kg: 87.3,
          created_at: new Date(),
        },
        {
          id: '2',
          user_id: userId,
          date: new Date(2025, 3, 15),
          weight_kg: 86.1,
          created_at: new Date(),
        },
        {
          id: '3',
          user_id: userId,
          date: new Date(2025, 5, 1),
          weight_kg: 84.5,
          created_at: new Date(),
        },
        {
          id: '4',
          user_id: userId,
          date: new Date(2025, 7, 1),
          weight_kg: 83.2,
          created_at: new Date(),
        },
        {
          id: '5',
          user_id: userId,
          date: new Date(2025, 9, 24),
          weight_kg: 82.6,
          created_at: new Date(),
        },
      ];
      setWeights(mockWeights);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addWeight = async (weight_kg: number, date: Date = new Date()) => {
    try {
      // TODO: Add to Firebase/Supabase
      const newWeight: Weight = {
        id: Date.now().toString(),
        user_id: userId,
        date,
        weight_kg,
        created_at: new Date(),
      };
      setWeights((prev) => [...prev, newWeight].sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (err) {
      setError(err as Error);
    }
  };

  const deleteWeight = async (id: string) => {
    try {
      // TODO: Delete from Firebase/Supabase
      setWeights((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err as Error);
    }
  };

  const getInitialWeight = () => {
    if (weights.length === 0) return null;
    return weights[0];
  };

  const getCurrentWeight = () => {
    if (weights.length === 0) return null;
    return weights[weights.length - 1];
  };

  return {
    weights,
    loading,
    error,
    addWeight,
    deleteWeight,
    getInitialWeight,
    getCurrentWeight,
    refresh: fetchWeights,
  };
};
