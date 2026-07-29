// Tipos do módulo de Controle de Peptídeos

export type DoseUnit = 'mg' | 'mcg' | 'UI';
export type VialUnit = 'mg' | 'UI';
export type Via = 'SC' | 'IM' | 'Tópico';

// Momento do dia em que o peptídeo é aplicado
export type Moment =
  | 'manha_jejum'
  | 'manha'
  | 'pos_treino'
  | 'noite'
  | 'local'
  | 'pontual';

// Tipo de ciclo do peptídeo
//  - continuous: todo dia
//  - weekly: dias fixos da semana (ex: Seg-Sex)
//  - onoff: X dias ON / Y dias OFF, rotativo
//  - training: só nos dias de treino (marcado manualmente)
export type CycleKind = 'continuous' | 'weekly' | 'onoff' | 'training';

// Nível de treino registrado no dia
export type TrainingLevel = 'forte' | 'normal' | 'off';

export interface PeptideCycle {
  kind: CycleKind;
  // weekly
  weekdays?: number[]; // 0=Dom ... 6=Sáb
  // onoff
  onDays?: number;
  offDays?: number;
  anchorDate?: string | null; // YYYY-MM-DD = dia 0 do primeiro ON (null = ainda não iniciado)
  // training
  requiresStrong?: boolean; // true = só treino forte; false = qualquer treino
  // informativo (ex: Lemon Bottle 2-3x/semana)
  weeklyTargetLabel?: string;
}

export interface Peptide {
  id: string;
  name: string;
  dose: number;
  doseUnit: DoseUnit;
  via: Via;
  moment: Moment;
  cycle: PeptideCycle;

  // Estoque (cada pacote comprado normalmente vem com 10 vials)
  vials: number;
  vialContent: number; // quantidade por vial
  vialUnit: VialUnit;

  active: boolean; // false = aguardando chegada (não entra na lista diária)
  incoming?: boolean; // fez parte do pedido "chegando"

  notes?: string;
  alerts?: string[]; // lembretes/regra exibidos junto do item
  conflictGroup?: string; // peptídeos com o mesmo grupo não podem ser usados no mesmo dia
  soloIM?: boolean; // aplicar IM sozinho

  createdAt: string;
  order?: number;
}

export interface DoseLog {
  id: string;
  peptideId: string;
  peptideName: string;
  date: string; // YYYY-MM-DD
  taken: boolean;
  dose: number;
  doseUnit: DoseUnit;
  loggedAt: string; // ISO
}

export interface TrainingDay {
  date: string; // YYYY-MM-DD
  level: TrainingLevel;
}

export interface PeptideBackup {
  version: number;
  exportedAt: string;
  peptides: Peptide[];
  logs: DoseLog[];
  training: TrainingDay[];
}
