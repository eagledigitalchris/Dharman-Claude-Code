import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface FABProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  style,
  backgroundColor = colors.progress.filled,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    handlePressOut();
    onPress();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.icon}>{icon}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
    color: colors.text.primary,
  },
});
