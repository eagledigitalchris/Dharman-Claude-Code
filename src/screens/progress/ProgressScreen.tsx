import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { pt_BR } from '../../constants/translations';
import { formatWeight, formatPercentage, formatMeasure } from '../../utils/formatters';
import { formatPeriod, getMonthsBetween } from '../../utils/dateHelpers';
import { calculateProgressPercentage, calculateWeightProgress } from '../../services/calculations';
import { MetricCard } from '../../components/cards/MetricCard';
import { CheckinCard } from '../../components/cards/CheckinCard';
import { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'progress' | 'history'>('progress');

  // Mock data - replace with actual hooks later
  const currentWeight = 82.6;
  const initialWeight = 87.3;
  const goalWeight = 77.0;
  const currentBodyFat = 18.4;
  const initialBodyFat = 23.8;
  const currentWaist = 83;
  const initialWaist = 100.5;
  const startDate = new Date(2025, 2, 1); // March 2025
  const currentDate = new Date(2025, 9, 24); // October 2025

  const monthsPassed = getMonthsBetween(startDate, currentDate);
  const period = formatPeriod(monthsPassed);

  const weightProgress = calculateWeightProgress(currentWeight, initialWeight, goalWeight);
  const weightProgressPercent = calculateProgressPercentage(
    initialWeight - currentWeight,
    initialWeight - goalWeight
  );

  const handleNavigateToWeightDetail = () => {
    navigation.navigate('WeightDetail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pt_BR.progress.title}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            {pt_BR.progress.title}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            {pt_BR.progress.history}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'progress' && (
          <>
            {/* Check-ins Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{pt_BR.progress.checkins}</Text>

              <TouchableOpacity style={styles.checkinBanner}>
                <Text style={styles.bannerTitle}>{pt_BR.progress.doCheckin}</Text>
                <Text style={styles.bannerSubtitle}>
                  {pt_BR.progress.nextCheckin} 2 {pt_BR.progress.days}
                </Text>
              </TouchableOpacity>

              {/* Mock checkin comparison card */}
              <CheckinCard
                beforePhotos={{
                  front: 'https://via.placeholder.com/100x150',
                  side: 'https://via.placeholder.com/100x150',
                  back: 'https://via.placeholder.com/100x150',
                }}
                afterPhotos={{
                  front: 'https://via.placeholder.com/100x150',
                  side: 'https://via.placeholder.com/100x150',
                  back: 'https://via.placeholder.com/100x150',
                }}
                beforeDate="Mar 2025"
                afterDate="Out 2025"
                period={period}
                onCompare={() => console.log('Compare photos')}
                onShare={() => console.log('Share progress')}
              />
            </View>

            {/* Measures Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{pt_BR.progress.measures}</Text>

              <MetricCard
                title={pt_BR.progress.weight}
                value={formatWeight(currentWeight)}
                delta={`${formatWeight(weightProgress.lost)} / ${formatWeight(weightProgress.total)}`}
                period={period}
                progress={weightProgressPercent}
                gradientColors={colors.gradients.weight}
                onPress={handleNavigateToWeightDetail}
              />

              <MetricCard
                title={pt_BR.progress.bodyFat}
                value={formatPercentage(currentBodyFat)}
                delta={formatPercentage(initialBodyFat - currentBodyFat)}
                period={period}
                progress={calculateProgressPercentage(
                  initialBodyFat - currentBodyFat,
                  initialBodyFat - 15
                )}
                gradientColors={colors.gradients.bodyFat}
              />

              <MetricCard
                title={pt_BR.progress.waist}
                value={formatMeasure(currentWaist, 'cm')}
                delta={formatMeasure(initialWaist - currentWaist, 'cm')}
                period={period}
                progress={calculateProgressPercentage(
                  initialWaist - currentWaist,
                  initialWaist - 75
                )}
                gradientColors={colors.gradients.waist}
              />
            </View>
          </>
        )}

        {activeTab === 'history' && (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Histórico em breve...</Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.progress.filled,
  },
  tabText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  checkinBanner: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.progress.filled,
    borderStyle: 'dashed',
  },
  bannerTitle: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  placeholderText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default ProgressScreen;
