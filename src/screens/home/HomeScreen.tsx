import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { pt_BR } from '../../constants/translations';
import { getTodayFormatted } from '../../utils/dateHelpers';
import { formatWater, formatSteps } from '../../utils/formatters';
import { calculateProgressPercentage } from '../../services/calculations';
import { FoodCard } from '../../components/cards/FoodCard';
import { ActivityCard } from '../../components/cards/ActivityCard';

const HomeScreen: React.FC = () => {
  // Mock data - replace with actual hooks later
  const [currentCalories] = useState(0);
  const [goalCalories] = useState(1725);
  const [protein] = useState(0);
  const [carbs] = useState(0);
  const [fat] = useState(0);

  const [currentWater] = useState(0);
  const [goalWater] = useState(3500);

  const [currentSteps] = useState(3016);
  const [goalSteps] = useState(8000);

  const waterProgress = calculateProgressPercentage(currentWater, goalWater);
  const stepsProgress = calculateProgressPercentage(currentSteps, goalSteps);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar-outline" size={24} color={colors.text.primary} style={styles.calendarIcon} />
          <Text style={styles.headerTitle}>{getTodayFormatted()}</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>U</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FoodCard
          currentCalories={currentCalories}
          goalCalories={goalCalories}
          protein={protein}
          carbs={carbs}
          fat={fat}
          onPress={() => console.log('Navigate to meal detail')}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{pt_BR.home.activity}</Text>
        </View>

        <View style={styles.activityGrid}>
          <ActivityCard
            icon="💧"
            value={formatWater(currentWater, goalWater)}
            gradientColors={colors.gradients.water}
            progress={waterProgress}
            onPress={() => console.log('Open water modal')}
          />
          <ActivityCard
            icon="👟"
            value={formatSteps(currentSteps, goalSteps)}
            gradientColors={colors.gradients.steps}
            progress={stepsProgress}
            onPress={() => console.log('Open steps modal')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  headerTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.progress.filled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
  activityGrid: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
