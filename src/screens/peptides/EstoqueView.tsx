import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Peptide } from '../../types/peptides';
import {
  computeStock,
  formatISOForHuman,
  formatDose,
} from '../../utils/peptideCycles';

interface EstoqueViewProps {
  peptides: Peptide[];
  today: string;
  onEdit: (p: Peptide) => void;
}

function stockColor(daysLeft: number | null, hasStock: boolean): string {
  if (!hasStock) return colors.text.secondary;
  if (daysLeft === null) return colors.success;
  if (daysLeft <= 7) return colors.error;
  if (daysLeft <= 21) return colors.warning;
  return colors.success;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  peptides,
  today,
  onEdit,
}) => {
  const sorted = [...peptides].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <View>
      {sorted.map((p) => {
        const stock = computeStock(p, today);
        const c = stockColor(stock.daysLeft, stock.hasStock);
        return (
          <TouchableOpacity
            key={p.id}
            style={styles.card}
            onPress={() => onEdit(p)}
            activeOpacity={0.85}
          >
            <View style={styles.headerRow}>
              <Text style={styles.name}>{p.name}</Text>
              {!p.active && (
                <View style={styles.incomingBadge}>
                  <Text style={styles.incomingText}>aguardando</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </View>

            <Text style={styles.sub}>
              Dose {formatDose(p.dose, p.doseUnit)} · {p.via}
            </Text>

            <View style={styles.stockRow}>
              <View style={styles.stockCol}>
                <Text style={styles.stockValue}>{p.vials}</Text>
                <Text style={styles.stockLabel}>vials</Text>
              </View>
              <View style={styles.stockCol}>
                <Text style={styles.stockValue}>
                  {stock.totalContent > 0
                    ? `${stock.totalContent} ${p.vialUnit}`
                    : '—'}
                </Text>
                <Text style={styles.stockLabel}>total</Text>
              </View>
              <View style={styles.stockCol}>
                <Text style={styles.stockValue}>
                  {stock.hasStock ? stock.dosesRemaining : '—'}
                </Text>
                <Text style={styles.stockLabel}>doses</Text>
              </View>
            </View>

            <View style={[styles.forecast, { borderColor: c + '55' }]}>
              <Ionicons name="hourglass-outline" size={14} color={c} />
              <Text style={[styles.forecastText, { color: c }]}>
                {!stock.hasStock
                  ? 'Informe o estoque'
                  : stock.daysLeft === null
                  ? 'Estoque para +2 anos'
                  : `Acaba em ~${stock.daysLeft} dias · ${formatISOForHuman(
                      stock.endDateISO!
                    )}`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.headline,
    color: colors.text.primary,
    flex: 1,
  },
  incomingBadge: {
    backgroundColor: colors.warning + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  incomingText: {
    ...typography.small,
    color: colors.warning,
    fontWeight: '700',
  },
  sub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  stockRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 12,
  },
  stockCol: {
    flex: 1,
    alignItems: 'center',
  },
  stockValue: {
    ...typography.headline,
    color: colors.text.primary,
  },
  stockLabel: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  forecast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  forecastText: {
    ...typography.caption,
    fontWeight: '600',
  },
});
