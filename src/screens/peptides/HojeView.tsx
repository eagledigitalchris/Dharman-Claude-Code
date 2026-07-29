import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Peptide, TrainingLevel } from '../../types/peptides';
import { DoseItem } from '../../components/peptides/DoseItem';
import { MOMENT_LABEL, MOMENT_ORDER, MOMENT_ICON } from '../../constants/peptideSeed';
import { getCycleStatus, detectConflicts } from '../../utils/peptideCycles';

interface HojeViewProps {
  peptides: Peptide[];
  training?: TrainingLevel;
  today: string;
  isTaken: (id: string) => boolean;
  onToggle: (p: Peptide) => void;
  onSetTraining: (level: TrainingLevel) => void;
}

const TRAINING_OPTS: { key: TrainingLevel; label: string }[] = [
  { key: 'forte', label: 'Forte' },
  { key: 'normal', label: 'Normal' },
  { key: 'off', label: 'Descanso' },
];

export const HojeView: React.FC<HojeViewProps> = ({
  peptides,
  training,
  today,
  isTaken,
  onToggle,
  onSetTraining,
}) => {
  const active = useMemo(
    () => peptides.filter((p) => p.active),
    [peptides]
  );

  const conflicts = useMemo(
    () => detectConflicts(active, today, training),
    [active, today, training]
  );

  // separa agendados hoje x fora do ciclo
  const scheduled: Peptide[] = [];
  const outOfCycle: { p: Peptide; countdown?: string }[] = [];
  for (const p of active) {
    const st = getCycleStatus(p, today, training);
    if (st.scheduledToday) scheduled.push(p);
    else outOfCycle.push({ p, countdown: st.countdown });
  }

  const takenCount = scheduled.filter((p) => isTaken(p.id)).length;

  // agrupa agendados por momento
  const byMoment = MOMENT_ORDER.map((m) => ({
    moment: m,
    items: scheduled.filter((p) => p.moment === m),
  })).filter((g) => g.items.length > 0);

  return (
    <View>
      {/* Registro de treino */}
      <View style={styles.trainingCard}>
        <Text style={styles.trainingLabel}>Treino de hoje</Text>
        <View style={styles.trainingRow}>
          {TRAINING_OPTS.map((opt) => {
            const on = training === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.trainingBtn, on && styles.trainingBtnOn]}
                onPress={() => onSetTraining(opt.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.trainingBtnText, on && styles.trainingBtnTextOn]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progresso do dia */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {takenCount}/{scheduled.length} aplicados hoje
        </Text>
      </View>

      {/* Conflitos */}
      {conflicts.map((c) => (
        <View key={c.group} style={styles.conflict}>
          <Ionicons name="warning" size={18} color={colors.error} />
          <Text style={styles.conflictText}>
            {c.names.join(' + ')} não podem ser usados no mesmo dia
          </Text>
        </View>
      ))}

      {/* Lista agrupada por momento */}
      {byMoment.map((g) => (
        <View key={g.moment} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name={MOMENT_ICON[g.moment] as any}
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.sectionTitle}>{MOMENT_LABEL[g.moment]}</Text>
          </View>
          {g.items.map((p) => {
            const st = getCycleStatus(p, today, training);
            return (
              <DoseItem
                key={p.id}
                peptide={p}
                taken={isTaken(p.id)}
                onToggle={() => onToggle(p)}
                countdown={st.phase === 'on' ? st.countdown : undefined}
              />
            );
          })}
        </View>
      ))}

      {scheduled.length === 0 && (
        <Text style={styles.empty}>Nada agendado para hoje.</Text>
      )}

      {/* Fora do ciclo / contagens */}
      {outOfCycle.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>Fora do ciclo hoje</Text>
          </View>
          {outOfCycle.map(({ p, countdown }) => (
            <View key={p.id} style={styles.offItem}>
              <Text style={styles.offName}>{p.name}</Text>
              {countdown ? <Text style={styles.offCountdown}>{countdown}</Text> : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  trainingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trainingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 10,
    fontWeight: '600',
  },
  trainingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trainingBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  trainingBtnOn: {
    backgroundColor: colors.gradients.steps[0],
    borderColor: colors.gradients.steps[0],
  },
  trainingBtnText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  trainingBtnTextOn: {
    color: colors.text.primary,
  },
  summary: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  summaryText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  conflict: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.error + '18',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  conflictText: {
    ...typography.caption,
    color: colors.error,
    flex: 1,
    fontWeight: '600',
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  empty: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
  },
  offItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 3,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    opacity: 0.7,
  },
  offName: {
    ...typography.body,
    color: colors.text.secondary,
  },
  offCountdown: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
});
