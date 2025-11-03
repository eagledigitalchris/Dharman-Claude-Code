import { useState, useEffect } from 'react';
import { HydrationLog } from '../types';
import { getStartOfDay, getEndOfDay } from '../utils/dateHelpers';
import { StorageService } from '../services/storage';

export const useWaterLogs = (userId: string, date: Date = new Date()) => {
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [totalWater, setTotalWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchWaterLogs();
  }, [userId, date]);

  const fetchWaterLogs = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from Firebase/Supabase for the specific date
      const dateKey = date.toISOString().split('T')[0];
      const cachedLogs = await StorageService.getWaterLogs(dateKey);

      if (cachedLogs) {
        setLogs(cachedLogs);
        setTotalWater(cachedLogs.reduce((sum, log) => sum + log.ml, 0));
      } else {
        setLogs([]);
        setTotalWater(0);
      }
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addWaterLog = async (ml: number) => {
    try {
      const newLog: HydrationLog = {
        id: Date.now().toString(),
        user_id: userId,
        date: new Date(),
        ml,
        logged_at: new Date(),
      };

      const updatedLogs = [...logs, newLog];
      setLogs(updatedLogs);
      setTotalWater((prev) => prev + ml);

      // Cache to AsyncStorage
      const dateKey = date.toISOString().split('T')[0];
      await StorageService.saveWaterLogs(dateKey, updatedLogs);

      // TODO: Save to Firebase/Supabase
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    logs,
    totalWater,
    loading,
    error,
    addWaterLog,
    refresh: fetchWaterLogs,
  };
};
