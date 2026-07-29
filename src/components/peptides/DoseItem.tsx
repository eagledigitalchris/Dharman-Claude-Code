import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Peptide } from '../../types/peptides';
import { formatDose } from '../../utils/peptideCycles';

interface DoseItemProps {
  peptide: Peptide;
  taken: boolean;
  onToggle: () => void;
  countdown?: string;
}

const VIA_COLOR: Record<string, string> = {
  SC: '#4ECDC4',
  IM: '#FF8C00',
  Tópico: '#8B7FE6',
};

export const DoseItem: React.FC<DoseItemProps> = ({
  peptide,
  taken,
  onToggle,
  countdown,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, taken && styles.containerTaken]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={[styles.check, taken && styles.checkOn]}>
        {taken && <Ionicons name="checkmark" size={18} color="#fff" />}
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, taken && styles.nameTaken]}>
            {peptide.name}
          </Text>
          <View
            style={[
              styles.viaBadge,
              { backgroundColor: (VIA_COLOR[peptide.via] || colors.progress.filled) + '22' },
            ]}
          >
            <Text style={[styles.viaText, { color: VIA_COLOR[peptide.via] || colors.progress.filled }]}>
              {peptide.via}
            </Text>
          </View>
        </View>

        <Text style={styles.dose}>{formatDose(peptide.dose, peptide.doseUnit)}</Text>

        {countdown ? <Text style={styles.countdown}>{countdown}</Text> : null}

        {peptide.alerts?.map((a, i) => (
          <Text key={i} style={styles.alert}>
            {a}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerTaken: {
    borderColor: colors.success,
    opacity: 0.75,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkOn: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.headline,
    color: colors.text.primary,
    marginRight: 8,
  },
  nameTaken: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  viaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  viaText: {
    ...typography.small,
    fontWeight: '700',
  },
  dose: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 2,
  },
  countdown: {
    ...typography.caption,
    color: colors.progress.filled,
    marginTop: 4,
    fontWeight: '600',
  },
  alert: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 4,
  },
});
