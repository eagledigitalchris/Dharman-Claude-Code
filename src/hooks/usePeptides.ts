import { useState, useCallback } from 'react';
import { Peptide, DoseLog, TrainingLevel } from '../types/peptides';
import { PeptideStorage } from '../services/peptideStorage';
import { toISODate } from '../utils/peptideCycles';

export function usePeptides() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [training, setTraining] = useState<TrainingLevel | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const today = toISODate();

  const refresh = useCallback(async () => {
    setLoading(true);
    const [ps, ls, tr] = await Promise.all([
      PeptideStorage.getPeptides(),
      PeptideStorage.getLogsForDate(today),
      PeptideStorage.getTrainingForDate(today),
    ]);
    setPeptides(ps);
    setLogs(ls);
    setTraining(tr);
    setLoading(false);
  }, [today]);

  const toggleDose = useCallback(
    async (peptide: Peptide) => {
      const current = logs.find(
        (l) => l.peptideId === peptide.id && l.date === today
      );
      const nextTaken = !(current?.taken ?? false);
      await PeptideStorage.setDoseLog(peptide, today, nextTaken);
      const ls = await PeptideStorage.getLogsForDate(today);
      setLogs(ls);
    },
    [logs, today]
  );

  const setTrainingLevel = useCallback(
    async (level: TrainingLevel) => {
      await PeptideStorage.setTraining(today, level);
      setTraining(level);
    },
    [today]
  );

  const savePeptide = useCallback(async (p: Peptide) => {
    const list = await PeptideStorage.upsertPeptide(p);
    setPeptides(list);
  }, []);

  const removePeptide = useCallback(async (id: string) => {
    const list = await PeptideStorage.deletePeptide(id);
    setPeptides(list);
  }, []);

  const isTaken = useCallback(
    (peptideId: string): boolean =>
      logs.find((l) => l.peptideId === peptideId && l.date === today)?.taken ??
      false,
    [logs, today]
  );

  return {
    peptides,
    logs,
    training,
    loading,
    today,
    refresh,
    toggleDose,
    setTrainingLevel,
    savePeptide,
    removePeptide,
    isTaken,
  };
}
