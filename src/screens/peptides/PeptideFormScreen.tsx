import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  Peptide,
  DoseUnit,
  VialUnit,
  Via,
  Moment,
  CycleKind,
} from '../../types/peptides';
import { PeptideStorage } from '../../services/peptideStorage';
import { MOMENT_LABEL, MOMENT_ORDER } from '../../constants/peptideSeed';
import { PeptidesStackParamList } from '../../types';
import { toISODate, WEEKDAYS_SHORT } from '../../utils/peptideCycles';

type FormRoute = RouteProp<PeptidesStackParamList, 'PeptideForm'>;

const DOSE_UNITS: DoseUnit[] = ['mg', 'mcg', 'UI'];
const VIALS_UNITS: VialUnit[] = ['mg', 'UI'];
const VIAS: Via[] = ['SC', 'IM', 'Tópico'];
const CYCLES: { key: CycleKind; label: string }[] = [
  { key: 'continuous', label: 'Todo dia' },
  { key: 'weekly', label: 'Dias fixos' },
  { key: 'onoff', label: 'ON / OFF' },
  { key: 'training', label: 'Treino' },
];

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillOn]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.pillText, active && styles.pillTextOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

const PeptideFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<FormRoute>();
  const editingId = route.params?.id;

  const [existing, setExisting] = useState<Peptide | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('mg');
  const [via, setVia] = useState<Via>('SC');
  const [moment, setMoment] = useState<Moment>('manha');
  const [cycleKind, setCycleKind] = useState<CycleKind>('continuous');
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [onDays, setOnDays] = useState('');
  const [offDays, setOffDays] = useState('');
  const [requiresStrong, setRequiresStrong] = useState(false);
  const [vials, setVials] = useState('');
  const [vialContent, setVialContent] = useState('');
  const [vialUnit, setVialUnit] = useState<VialUnit>('mg');
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!editingId) return;
    PeptideStorage.getPeptides().then((list) => {
      const p = list.find((x) => x.id === editingId);
      if (!p) return;
      setExisting(p);
      setName(p.name);
      setDose(String(p.dose));
      setDoseUnit(p.doseUnit);
      setVia(p.via);
      setMoment(p.moment);
      setCycleKind(p.cycle.kind);
      setWeekdays(p.cycle.weekdays ?? [1, 2, 3, 4, 5]);
      setOnDays(p.cycle.onDays ? String(p.cycle.onDays) : '');
      setOffDays(p.cycle.offDays ? String(p.cycle.offDays) : '');
      setRequiresStrong(!!p.cycle.requiresStrong);
      setVials(String(p.vials));
      setVialContent(p.vialContent ? String(p.vialContent) : '');
      setVialUnit(p.vialUnit);
      setActive(p.active);
      setNotes(p.notes ?? '');
    });
  }, [editingId]);

  const toggleWeekday = (d: number) => {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do peptídeo.');
      return;
    }
    const doseNum = parseFloat(dose.replace(',', '.')) || 0;

    // Se ON/OFF passa a ativo e ainda não tem âncora, inicia hoje.
    let anchorDate = existing?.cycle.anchorDate ?? null;
    if (cycleKind === 'onoff' && active && !anchorDate) {
      anchorDate = toISODate();
    }

    const peptide: Peptide = {
      id: editingId || PeptideStorage.newId(),
      name: name.trim(),
      dose: doseNum,
      doseUnit,
      via,
      moment,
      cycle: {
        kind: cycleKind,
        weekdays: cycleKind === 'weekly' ? weekdays : existing?.cycle.weekdays,
        onDays: cycleKind === 'onoff' ? parseInt(onDays, 10) || 0 : existing?.cycle.onDays,
        offDays: cycleKind === 'onoff' ? parseInt(offDays, 10) || 0 : existing?.cycle.offDays,
        anchorDate: cycleKind === 'onoff' ? anchorDate : null,
        requiresStrong: cycleKind === 'training' ? requiresStrong : existing?.cycle.requiresStrong,
        weeklyTargetLabel: existing?.cycle.weeklyTargetLabel,
      },
      vials: parseInt(vials, 10) || 0,
      vialContent: parseFloat(vialContent.replace(',', '.')) || 0,
      vialUnit,
      active,
      incoming: existing?.incoming,
      notes: notes.trim() || undefined,
      alerts: existing?.alerts,
      conflictGroup: existing?.conflictGroup,
      soloIM: existing?.soloIM,
      createdAt: existing?.createdAt || new Date().toISOString(),
      order: existing?.order,
    };

    await PeptideStorage.upsertPeptide(peptide);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!editingId) return;
    Alert.alert('Remover peptídeo', `Remover ${name} do protocolo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await PeptideStorage.deletePeptide(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {editingId ? 'Editar peptídeo' : 'Novo peptídeo'}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Ex: BPC-157" />

        <View style={styles.row}>
          <Input
            label="Dose"
            value={dose}
            onChangeText={setDose}
            keyboardType="numeric"
            placeholder="0"
            containerStyle={styles.flex1}
          />
          <View style={styles.gap} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Unidade</Text>
            <View style={styles.pillRow}>
              {DOSE_UNITS.map((u) => (
                <Pill key={u} label={u} active={doseUnit === u} onPress={() => setDoseUnit(u)} />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.label}>Via</Text>
        <View style={styles.pillRow}>
          {VIAS.map((v) => (
            <Pill key={v} label={v} active={via === v} onPress={() => setVia(v)} />
          ))}
        </View>

        <Text style={styles.label}>Momento</Text>
        <View style={styles.pillRow}>
          {MOMENT_ORDER.map((m) => (
            <Pill key={m} label={MOMENT_LABEL[m]} active={moment === m} onPress={() => setMoment(m)} />
          ))}
        </View>

        <Text style={styles.label}>Ciclo</Text>
        <View style={styles.pillRow}>
          {CYCLES.map((c) => (
            <Pill key={c.key} label={c.label} active={cycleKind === c.key} onPress={() => setCycleKind(c.key)} />
          ))}
        </View>

        {cycleKind === 'weekly' && (
          <>
            <Text style={styles.label}>Dias da semana</Text>
            <View style={styles.pillRow}>
              {WEEKDAYS_SHORT.map((d, i) => (
                <Pill key={i} label={d} active={weekdays.includes(i)} onPress={() => toggleWeekday(i)} />
              ))}
            </View>
          </>
        )}

        {cycleKind === 'onoff' && (
          <View style={styles.row}>
            <Input
              label="Dias ON"
              value={onDays}
              onChangeText={setOnDays}
              keyboardType="numeric"
              placeholder="10"
              containerStyle={styles.flex1}
            />
            <View style={styles.gap} />
            <Input
              label="Dias OFF"
              value={offDays}
              onChangeText={setOffDays}
              keyboardType="numeric"
              placeholder="20"
              containerStyle={styles.flex1}
            />
          </View>
        )}

        {cycleKind === 'training' && (
          <>
            <Text style={styles.label}>Exige treino forte?</Text>
            <View style={styles.pillRow}>
              <Pill label="Qualquer treino" active={!requiresStrong} onPress={() => setRequiresStrong(false)} />
              <Pill label="Só treino forte" active={requiresStrong} onPress={() => setRequiresStrong(true)} />
            </View>
          </>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Estoque</Text>
        <Text style={styles.hint}>Cada pacote geralmente vem com 10 vials.</Text>

        <View style={styles.row}>
          <Input
            label="Qtd. de vials"
            value={vials}
            onChangeText={setVials}
            keyboardType="numeric"
            placeholder="0"
            containerStyle={styles.flex1}
          />
          <View style={styles.gap} />
          <Input
            label="mg por vial"
            value={vialContent}
            onChangeText={setVialContent}
            keyboardType="numeric"
            placeholder="0"
            containerStyle={styles.flex1}
          />
        </View>

        <Text style={styles.label}>Unidade do vial</Text>
        <View style={styles.pillRow}>
          {VIALS_UNITS.map((u) => (
            <Pill key={u} label={u} active={vialUnit === u} onPress={() => setVialUnit(u)} />
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Status</Text>
        <View style={styles.pillRow}>
          <Pill label="Ativo no protocolo" active={active} onPress={() => setActive(true)} />
          <Pill label="Aguardando chegada" active={!active} onPress={() => setActive(false)} />
        </View>

        <Input
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex: dextrose + whey obrigatório"
          multiline
          containerStyle={{ marginTop: 8 }}
        />

        <Button title="Salvar" onPress={handleSave} style={{ marginTop: 8 }} />

        {editingId && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={styles.deleteText}>Remover do protocolo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: {
    ...typography.headline,
    color: colors.text.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: { flex: 1 },
  gap: { width: 12 },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionLabel: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: 4,
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillOn: {
    backgroundColor: colors.progress.filled,
    borderColor: colors.progress.filled,
  },
  pillText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  pillTextOn: {
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
  },
  deleteText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
});

export default PeptideFormScreen;
