import { useState, useEffect } from 'react';
import { Measure } from '../types';

export const useMeasures = (userId: string) => {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchMeasures();
  }, [userId]);

  const fetchMeasures = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Firebase/Supabase
      // Mock data for now
      const mockMeasures: Measure[] = [
        {
          id: '1',
          user_id: userId,
          date: new Date(2025, 2, 1),
          waist_cm: 100.5,
          body_fat_pct: 23.8,
          created_at: new Date(),
        },
        {
          id: '2',
          user_id: userId,
          date: new Date(2025, 9, 24),
          waist_cm: 83,
          body_fat_pct: 18.4,
          created_at: new Date(),
        },
      ];
      setMeasures(mockMeasures);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addMeasure = async (measure: Omit<Measure, 'id' | 'user_id' | 'created_at'>) => {
    try {
      // TODO: Add to Firebase/Supabase
      const newMeasure: Measure = {
        ...measure,
        id: Date.now().toString(),
        user_id: userId,
        created_at: new Date(),
      };
      setMeasures((prev) => [...prev, newMeasure].sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (err) {
      setError(err as Error);
    }
  };

  const getLatestMeasure = () => {
    if (measures.length === 0) return null;
    return measures[measures.length - 1];
  };

  const getInitialMeasure = () => {
    if (measures.length === 0) return null;
    return measures[0];
  };

  return {
    measures,
    loading,
    error,
    addMeasure,
    getLatestMeasure,
    getInitialMeasure,
    refresh: fetchMeasures,
  };
};
