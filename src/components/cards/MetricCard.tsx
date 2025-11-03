import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { ProgressBar } from '../common/ProgressBar';

interface MetricCardProps {
  title: string;
  value: string;
  delta: string;
  period: string;
  progress: number;
  gradientColors: readonly string[];
  onPress?: () => void;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  delta,
  period,
  progress,
  gradientColors,
  onPress,
  isPositive = true,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        <View style={styles.deltaContainer}>
          <Text style={[styles.delta, !isPositive && styles.deltaPositive]}>
            {isPositive ? '↓' : '↑'} {delta}
          </Text>
          <Text style={styles.period}>{period}</Text>
        </View>
        <ProgressBar
          progress={progress}
          color="rgba(255, 255, 255, 0.9)"
          backgroundColor="rgba(255, 255, 255, 0.2)"
          style={styles.progressBar}
        />
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 24,
    minHeight: 160,
  },
  title: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  value: {
    ...typography.hero,
    color: colors.text.primary,
    fontWeight: '700',
  },
  deltaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  delta: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
    marginRight: 8,
  },
  deltaPositive: {
    color: colors.error,
  },
  period: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBar: {
    marginTop: 8,
  },
});
