import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { DoseLog } from '../../types/peptides';
import { PeptideStorage } from '../../services/peptideStorage';
import { formatISOForHuman, formatDose } from '../../utils/peptideCycles';

interface HistoricoViewProps {
  refreshKey: number;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({ refreshKey }) => {
  const [logs, setLogs] = useState<DoseLog[]>([]);

  useEffect(() => {
    PeptideStorage.getLogs().then((all) => {
      const sorted = [...all].sort((a, b) =>
        b.loggedAt.localeCompare(a.loggedAt)
      );
      setLogs(sorted);
    });
  }, [refreshKey]);

  // agrupa por data
  const byDate: { date: string; items: DoseLog[] }[] = [];
  for (const l of logs) {
    let group = byDate.find((g) => g.date === l.date);
    if (!group) {
      group = { date: l.date, items: [] };
      byDate.push(group);
    }
    group.items.push(l);
  }
  byDate.sort((a, b) => b.date.localeCompare(a.date));

  if (logs.length === 0) {
    return (
      <Text style={styles.empty}>
        Sem registros ainda. Dê check nas doses na aba Hoje.
      </Text>
    );
  }

  return (
    <View>
      {byDate.map((g) => {
        const taken = g.items.filter((i) => i.taken).length;
        return (
          <View key={g.date} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupDate}>{formatISOForHuman(g.date)}</Text>
              <Text style={styles.groupCount}>{taken} aplicados</Text>
            </View>
            {g.items.map((l) => (
              <View key={l.id} style={styles.row}>
                <Ionicons
                  name={l.taken ? 'checkmark-circle' : 'close-circle-outline'}
                  size={18}
                  color={l.taken ? colors.success : colors.text.secondary}
                />
                <Text style={[styles.name, !l.taken && styles.nameSkipped]}>
                  {l.peptideName}
                </Text>
                <Text style={styles.dose}>{formatDose(l.dose, l.doseUnit)}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupDate: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  groupCount: {
    ...typography.small,
    color: colors.text.secondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  nameSkipped: {
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  dose: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  empty: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 24,
  },
});
