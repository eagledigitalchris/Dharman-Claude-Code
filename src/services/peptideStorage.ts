import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Peptide,
  DoseLog,
  TrainingDay,
  TrainingLevel,
  PeptideBackup,
} from '../types/peptides';
import { PEPTIDE_SEED } from '../constants/peptideSeed';

const KEYS = {
  PEPTIDES: '@pep_peptides_v1',
  LOGS: '@pep_dose_logs_v1',
  TRAINING: '@pep_training_v1',
  SEEDED: '@pep_seeded_v1',
};

function uid(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const PeptideStorage = {
  // ── Peptídeos ──────────────────────────────
  async getPeptides(): Promise<Peptide[]> {
    const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
    if (!seeded) {
      await AsyncStorage.setItem(KEYS.PEPTIDES, JSON.stringify(PEPTIDE_SEED));
      await AsyncStorage.setItem(KEYS.SEEDED, '1');
      return PEPTIDE_SEED;
    }
    const raw = await AsyncStorage.getItem(KEYS.PEPTIDES);
    return raw ? (JSON.parse(raw) as Peptide[]) : [];
  },

  async savePeptides(list: Peptide[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.PEPTIDES, JSON.stringify(list));
  },

  async upsertPeptide(p: Peptide): Promise<Peptide[]> {
    const list = await this.getPeptides();
    const idx = list.findIndex((x) => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.push({ ...p, id: p.id || uid() });
    await this.savePeptides(list);
    return list;
  },

  async deletePeptide(id: string): Promise<Peptide[]> {
    const list = (await this.getPeptides()).filter((x) => x.id !== id);
    await this.savePeptides(list);
    return list;
  },

  newId: uid,

  // ── Logs de dose ───────────────────────────
  async getLogs(): Promise<DoseLog[]> {
    const raw = await AsyncStorage.getItem(KEYS.LOGS);
    return raw ? (JSON.parse(raw) as DoseLog[]) : [];
  },

  async getLogsForDate(dateISO: string): Promise<DoseLog[]> {
    return (await this.getLogs()).filter((l) => l.date === dateISO);
  },

  // Registra/atualiza (toggle) a dose de um peptídeo num dia.
  async setDoseLog(
    peptide: Peptide,
    dateISO: string,
    taken: boolean
  ): Promise<DoseLog[]> {
    const logs = await this.getLogs();
    const idx = logs.findIndex(
      (l) => l.peptideId === peptide.id && l.date === dateISO
    );
    const entry: DoseLog = {
      id: idx >= 0 ? logs[idx].id : uid(),
      peptideId: peptide.id,
      peptideName: peptide.name,
      date: dateISO,
      taken,
      dose: peptide.dose,
      doseUnit: peptide.doseUnit,
      loggedAt: new Date().toISOString(),
    };
    if (idx >= 0) logs[idx] = entry;
    else logs.push(entry);
    await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
    return logs;
  },

  // ── Treino ─────────────────────────────────
  async getTraining(): Promise<TrainingDay[]> {
    const raw = await AsyncStorage.getItem(KEYS.TRAINING);
    return raw ? (JSON.parse(raw) as TrainingDay[]) : [];
  },

  async getTrainingForDate(dateISO: string): Promise<TrainingLevel | undefined> {
    const t = (await this.getTraining()).find((x) => x.date === dateISO);
    return t?.level;
  },

  async setTraining(
    dateISO: string,
    level: TrainingLevel
  ): Promise<TrainingDay[]> {
    const list = await this.getTraining();
    const idx = list.findIndex((x) => x.date === dateISO);
    if (idx >= 0) list[idx] = { date: dateISO, level };
    else list.push({ date: dateISO, level });
    await AsyncStorage.setItem(KEYS.TRAINING, JSON.stringify(list));
    return list;
  },

  // ── Backup ─────────────────────────────────
  async exportAll(): Promise<PeptideBackup> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      peptides: await this.getPeptides(),
      logs: await this.getLogs(),
      training: await this.getTraining(),
    };
  },

  async importAll(backup: PeptideBackup): Promise<void> {
    if (backup.peptides)
      await AsyncStorage.setItem(KEYS.PEPTIDES, JSON.stringify(backup.peptides));
    if (backup.logs)
      await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(backup.logs));
    if (backup.training)
      await AsyncStorage.setItem(KEYS.TRAINING, JSON.stringify(backup.training));
    await AsyncStorage.setItem(KEYS.SEEDED, '1');
  },

  async resetToSeed(): Promise<void> {
    await AsyncStorage.setItem(KEYS.PEPTIDES, JSON.stringify(PEPTIDE_SEED));
    await AsyncStorage.removeItem(KEYS.LOGS);
    await AsyncStorage.removeItem(KEYS.TRAINING);
    await AsyncStorage.setItem(KEYS.SEEDED, '1');
  },
};
