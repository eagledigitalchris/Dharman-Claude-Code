import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Segmented } from '../../components/peptides/Segmented';
import { usePeptides } from '../../hooks/usePeptides';
import { HojeView } from './HojeView';
import { EstoqueView } from './EstoqueView';
import { HistoricoView } from './HistoricoView';
import { PeptidesStackParamList } from '../../types';
import { formatISOForHuman } from '../../utils/peptideCycles';

type Nav = NativeStackNavigationProp<PeptidesStackParamList, 'PeptidesHome'>;

const TABS = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'estoque', label: 'Estoque' },
  { key: 'historico', label: 'Histórico' },
];

const PeptidesHomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState('hoje');
  const [histKey, setHistKey] = useState(0);
  const {
    peptides,
    training,
    today,
    refresh,
    toggleDose,
    setTrainingLevel,
    isTaken,
  } = usePeptides();

  useFocusEffect(
    useCallback(() => {
      refresh();
      setHistKey((k) => k + 1);
    }, [refresh])
  );

  const handleToggle = async (p: any) => {
    await toggleDose(p);
    setHistKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Peptídeos</Text>
          <Text style={styles.date}>{formatISOForHuman(today)}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('PeptideAjustes')}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('PeptideForm', {})}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={26} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Segmented options={TABS} value={tab} onChange={setTab} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'hoje' && (
          <HojeView
            peptides={peptides}
            training={training}
            today={today}
            isTaken={isTaken}
            onToggle={handleToggle}
            onSetTraining={setTrainingLevel}
          />
        )}
        {tab === 'estoque' && (
          <EstoqueView
            peptides={peptides}
            today={today}
            onEdit={(p) => navigation.navigate('PeptideForm', { id: p.id })}
          />
        )}
        {tab === 'historico' && <HistoricoView refreshKey={histKey} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  date: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.progress.filled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 4,
  },
});

export default PeptidesHomeScreen;
