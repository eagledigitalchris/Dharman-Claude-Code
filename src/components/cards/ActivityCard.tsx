import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { ProgressBar } from '../common/ProgressBar';

interface ActivityCardProps {
  icon: string;
  value: string;
  gradientColors: readonly string[];
  progress: number;
  onPress: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  icon,
  value,
  gradientColors,
  progress,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.value}>{value}</Text>
        <ProgressBar
          progress={progress}
          color="rgba(255, 255, 255, 0.9)"
          backgroundColor="rgba(255, 255, 255, 0.2)"
          style={styles.progressBar}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 32,
  },
  value: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  progressBar: {
    marginTop: 12,
  },
});
