import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { ProgressBar } from '../common/ProgressBar';
import { formatCalories, formatMacros } from '../../utils/formatters';
import { calculateProgressPercentage } from '../../services/calculations';

interface FoodCardProps {
  currentCalories: number;
  goalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  onPress: () => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  currentCalories,
  goalCalories,
  protein,
  carbs,
  fat,
  onPress,
}) => {
  const progress = calculateProgressPercentage(currentCalories, goalCalories);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.calories}>{formatCalories(currentCalories, goalCalories)}</Text>
            <Text style={styles.macros}>{formatMacros(protein, carbs, fat)}</Text>
          </View>
          <ProgressBar progress={progress} style={styles.progressBar} />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
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
  imageBackground: {
    width: '100%',
    height: 200,
  },
  image: {
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  content: {
    marginBottom: 12,
  },
  calories: {
    ...typography.hero,
    color: colors.text.primary,
    fontWeight: '700',
  },
  macros: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 4,
  },
  progressBar: {
    marginTop: 8,
  },
});
