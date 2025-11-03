import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

const PlaceholderScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Em breve...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.title,
    color: colors.text.secondary,
  },
});

export default PlaceholderScreen;
