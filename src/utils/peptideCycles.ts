import { Peptide, TrainingLevel } from '../types/peptides';

// ─────────────────────────────────────────────
// Helpers de data (baseados em string YYYY-MM-DD)
// ─────────────────────────────────────────────
export const toISODate = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseISODate = (iso: string): Date => new Date(`${iso}T00:00:00`);

export const dayDiff = (fromISO: string, toISO: string): number =>
  Math.round(
    (parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()) / 86400000
  );

export const addDaysISO = (iso: string, days: number): string => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const weekdayOf = (iso: string): number => parseISODate(iso).getDay();

export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const formatISOForHuman = (iso: string): string => {
  const d = parseISODate(iso);
  const months = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// ─────────────────────────────────────────────
// Status de ciclo
// ─────────────────────────────────────────────
export type CyclePhase = 'always' | 'on' | 'off' | 'waiting' | 'weekly' | 'training';

export interface CycleStatus {
  phase: CyclePhase;
  on: boolean; // aplicável hoje segundo o ciclo (sem contar treino manual)
  scheduledToday: boolean; // deve aparecer na lista de hoje
  label: string; // texto curto de status
  countdown?: string; // ex: "faltam 3 dias p/ OFF"
  daysLeft?: number;
}

export function getCycleStatus(
  peptide: Peptide,
  dateISO: string,
  trainingLevel?: TrainingLevel
): CycleStatus {
  const { cycle } = peptide;

  if (cycle.kind === 'continuous') {
    return {
      phase: 'always',
      on: true,
      scheduledToday: true,
      label: 'Todo dia',
    };
  }

  if (cycle.kind === 'weekly') {
    const wd = weekdayOf(dateISO);
    const days = cycle.weekdays ?? [];
    const on = days.includes(wd);
    const daysLabel = days.map((d) => WEEKDAYS_SHORT[d]).join(' · ');
    return {
      phase: 'weekly',
      on,
      scheduledToday: on,
      label: cycle.weeklyTargetLabel ? cycle.weeklyTargetLabel : daysLabel,
      countdown: on ? 'Hoje sim' : 'Hoje não',
    };
  }

  if (cycle.kind === 'training') {
    const trained =
      trainingLevel === 'forte' ||
      (trainingLevel === 'normal' && !cycle.requiresStrong);
    return {
      phase: 'training',
      on: trained,
      scheduledToday: trained,
      label: cycle.requiresStrong ? 'Dias de treino forte' : 'Dias de treino',
      countdown: trained
        ? 'Treino registrado hoje'
        : 'Marque o treino para liberar',
    };
  }

  // onoff
  const onDays = cycle.onDays ?? 0;
  const offDays = cycle.offDays ?? 0;
  const period = onDays + offDays;

  if (!cycle.anchorDate || period <= 0) {
    return {
      phase: 'waiting',
      on: false,
      scheduledToday: false,
      label: `${onDays} ON / ${offDays} OFF`,
      countdown: 'Aguardando início',
    };
  }

  const diff = dayDiff(cycle.anchorDate, dateISO);

  if (diff < 0) {
    return {
      phase: 'waiting',
      on: false,
      scheduledToday: false,
      label: `${onDays} ON / ${offDays} OFF`,
      countdown: `Inicia em ${-diff} ${-diff === 1 ? 'dia' : 'dias'}`,
      daysLeft: -diff,
    };
  }

  const pos = ((diff % period) + period) % period;

  if (pos < onDays) {
    const daysLeft = onDays - pos;
    return {
      phase: 'on',
      on: true,
      scheduledToday: true,
      label: `${onDays} ON / ${offDays} OFF`,
      countdown: `Faltam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} p/ OFF`,
      daysLeft,
    };
  }

  const daysLeft = period - pos;
  return {
    phase: 'off',
    on: false,
    scheduledToday: false,
    label: `${onDays} ON / ${offDays} OFF`,
    countdown: `OFF · volta em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`,
    daysLeft,
  };
}

// ─────────────────────────────────────────────
// Estoque e previsão de duração
// ─────────────────────────────────────────────

// Converte para uma base comparável (mcg para massa; UI mantém).
function toBase(amount: number, unit: string): number {
  if (unit === 'mg') return amount * 1000;
  if (unit === 'mcg') return amount;
  return amount; // UI
}

export interface StockInfo {
  totalContent: number; // no vialUnit
  dosesRemaining: number;
  hasStock: boolean;
  endDateISO: string | null; // data prevista de término
  daysLeft: number | null; // dias até acabar (null = >2 anos ou sem dados)
  perWeek: number; // média de doses por semana
}

// Frequência assumida de treino para previsão (dias/semana)
const ASSUMED_TRAINING_DAYS = [1, 2, 4, 5]; // Seg, Ter, Qui, Sex

function isScheduledForForecast(peptide: Peptide, dateISO: string): boolean {
  const { cycle } = peptide;
  switch (cycle.kind) {
    case 'continuous':
      return true;
    case 'weekly':
      return (cycle.weekdays ?? []).includes(weekdayOf(dateISO));
    case 'training':
      return ASSUMED_TRAINING_DAYS.includes(weekdayOf(dateISO));
    case 'onoff':
      return getCycleStatus(peptide, dateISO).on;
    default:
      return false;
  }
}

function dosesPerWeek(peptide: Peptide): number {
  const { cycle } = peptide;
  switch (cycle.kind) {
    case 'continuous':
      return 7;
    case 'weekly':
      return (cycle.weekdays ?? []).length;
    case 'training':
      return ASSUMED_TRAINING_DAYS.length;
    case 'onoff': {
      const on = cycle.onDays ?? 0;
      const off = cycle.offDays ?? 0;
      const period = on + off;
      return period > 0 ? (on / period) * 7 : 0;
    }
    default:
      return 0;
  }
}

export function computeStock(peptide: Peptide, fromISO: string): StockInfo {
  const totalContent = peptide.vials * peptide.vialContent;
  const doseBase = toBase(peptide.dose, peptide.doseUnit);
  const totalBase = toBase(totalContent, peptide.vialUnit);

  const dosesRemaining =
    doseBase > 0 ? Math.floor(totalBase / doseBase) : 0;
  const perWeek = dosesPerWeek(peptide);
  const hasStock = totalContent > 0 && doseBase > 0;

  if (!hasStock || dosesRemaining <= 0) {
    return {
      totalContent,
      dosesRemaining,
      hasStock,
      endDateISO: null,
      daysLeft: null,
      perWeek,
    };
  }

  // Simula dia a dia até esgotar (cap de 2 anos)
  let remaining = dosesRemaining;
  const MAX_DAYS = 730;
  let endDateISO: string | null = null;
  for (let i = 0; i < MAX_DAYS; i++) {
    const dISO = addDaysISO(fromISO, i);
    if (isScheduledForForecast(peptide, dISO)) {
      remaining -= 1;
      if (remaining <= 0) {
        endDateISO = dISO;
        break;
      }
    }
  }

  return {
    totalContent,
    dosesRemaining,
    hasStock,
    endDateISO,
    daysLeft: endDateISO ? dayDiff(fromISO, endDateISO) : null,
    perWeek,
  };
}

// ─────────────────────────────────────────────
// Detecção de conflito (ex: Cerebrolysin + Dihexa no mesmo dia)
// ─────────────────────────────────────────────
export interface ConflictWarning {
  group: string;
  names: string[];
}

export function detectConflicts(
  peptides: Peptide[],
  dateISO: string,
  trainingLevel?: TrainingLevel
): ConflictWarning[] {
  const groups: Record<string, string[]> = {};
  for (const p of peptides) {
    if (!p.active || !p.conflictGroup) continue;
    const status = getCycleStatus(p, dateISO, trainingLevel);
    if (status.scheduledToday) {
      groups[p.conflictGroup] = groups[p.conflictGroup] || [];
      groups[p.conflictGroup].push(p.name);
    }
  }
  return Object.entries(groups)
    .filter(([, names]) => names.length > 1)
    .map(([group, names]) => ({ group, names }));
}

// Formata dose para exibição
export function formatDose(dose: number, unit: string): string {
  const n = Number.isInteger(dose) ? dose.toString() : dose.toString().replace('.', ',');
  return `${n} ${unit}`;
}
