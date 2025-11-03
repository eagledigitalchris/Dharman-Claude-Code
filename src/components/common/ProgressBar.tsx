import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.progress.filled,
  backgroundColor = colors.progress.empty,
  height = 6,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { backgroundColor, height }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});
