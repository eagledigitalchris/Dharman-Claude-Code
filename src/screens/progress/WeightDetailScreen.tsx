import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { pt_BR } from '../../constants/translations';
import { formatWeight, formatDate } from '../../utils/formatters';
import { formatPeriod, getMonthsBetween } from '../../utils/dateHelpers';
import { calculateWeightProgress } from '../../services/calculations';
import { FAB } from '../../components/common/FAB';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const screenWidth = Dimensions.get('window').width;

interface WeightEntry {
  id: string;
  date: Date;
  weight_kg: number;
}

const WeightDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date());

  // Mock data - replace with actual hooks later
  const [weightHistory] = useState<WeightEntry[]>([
    { id: '1', date: new Date(2025, 2, 1), weight_kg: 87.3 },
    { id: '2', date: new Date(2025, 3, 15), weight_kg: 86.1 },
    { id: '3', date: new Date(2025, 5, 1), weight_kg: 84.5 },
    { id: '4', date: new Date(2025, 7, 1), weight_kg: 83.2 },
    { id: '5', date: new Date(2025, 9, 24), weight_kg: 82.6 },
  ]);

  const currentWeight = weightHistory[weightHistory.length - 1].weight_kg;
  const initialWeight = weightHistory[0].weight_kg;
  const goalWeight = 77.0;
  const startDate = weightHistory[0].date;
  const currentDate = weightHistory[weightHistory.length - 1].date;

  const monthsPassed = getMonthsBetween(startDate, currentDate);
  const period = formatPeriod(monthsPassed);
  const progress = calculateWeightProgress(currentWeight, initialWeight, goalWeight);

  const chartData = {
    labels: weightHistory.map((w) => {
      const month = w.date.getMonth();
      return pt_BR.months.short[month];
    }),
    datasets: [
      {
        data: weightHistory.map((w) => w.weight_kg),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const handleSaveWeight = () => {
    // TODO: Implement save logic
    console.log('Save weight:', newWeight, newDate);
    setModalVisible(false);
    setNewWeight('');
  };

  const handleDeleteWeight = (id: string) => {
    // TODO: Implement delete logic
    console.log('Delete weight:', id);
  };

  const renderWeightItem = ({ item }: { item: WeightEntry }) => (
    <View style={styles.weightRow}>
      <Text style={styles.weightDate}>{formatDate(item.date)}</Text>
      <Text style={styles.weightValue}>{formatWeight(item.weight_kg)}</Text>
      <TouchableOpacity onPress={() => handleDeleteWeight(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.weight as any} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{pt_BR.progress.weight}</Text>
          <Text style={styles.headerValue}>{formatWeight(currentWeight)}</Text>
          <Text style={styles.headerDelta}>
            ↓ {formatWeight(progress.lost)} / {formatWeight(progress.total)} {period}
          </Text>
          <Text style={styles.headerDate}>{formatDate(currentDate)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 1,
            color: (opacity = 1) => colors.gradients.weight[0],
            labelColor: (opacity = 1) => colors.text.secondary,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.gradients.weight[0],
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Histórico</Text>
      </View>

      <FlatList
        data={[...weightHistory].reverse()}
        renderItem={renderWeightItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <FAB icon="+" onPress={() => setModalVisible(true)} />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Peso</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Peso (kg)"
              placeholder="82,5"
              keyboardType="decimal-pad"
              value={newWeight}
              onChangeText={setNewWeight}
            />

            <Button
              title={pt_BR.common.save}
              onPress={handleSaveWeight}
              disabled={!newWeight}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  headerValue: {
    ...typography.hero,
    color: colors.text.primary,
    fontWeight: '700',
  },
  headerDelta: {
    ...typography.headline,
    color: colors.success,
    marginTop: 8,
  },
  headerDate: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  listHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  weightDate: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  weightValue: {
    ...typography.headline,
    color: colors.text.primary,
    fontWeight: '600',
    marginRight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
});

export default WeightDetailScreen;
