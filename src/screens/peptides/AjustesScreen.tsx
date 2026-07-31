import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { PeptideStorage } from '../../services/peptideStorage';
import { PeptideBackup } from '../../types/peptides';

const AjustesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [counts, setCounts] = useState({ peptides: 0, logs: 0, training: 0 });
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const loadCounts = async () => {
    const b = await PeptideStorage.exportAll();
    setCounts({
      peptides: b.peptides.length,
      logs: b.logs.length,
      training: b.training.length,
    });
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleExport = async () => {
    const backup = await PeptideStorage.exportAll();
    const json = JSON.stringify(backup, null, 2);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'protocolo-peptideos-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Alert.alert('Backup exportado', 'Arquivo baixado com seus dados.');
    } else {
      try {
        await Share.share({ message: json });
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível compartilhar o backup.');
      }
    }
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText) as PeptideBackup;
      if (!parsed.peptides || !Array.isArray(parsed.peptides)) {
        Alert.alert('Arquivo inválido', 'O conteúdo não parece um backup válido.');
        return;
      }
      await PeptideStorage.importAll(parsed);
      await loadCounts();
      setImportText('');
      setShowImport(false);
      Alert.alert('Importado', 'Seus dados foram restaurados.');
    } catch (e) {
      Alert.alert('Erro ao importar', 'Verifique se colou o JSON completo do backup.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Restaurar protocolo padrão',
      'Isso apaga o histórico e o estoque e volta ao protocolo inicial. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await PeptideStorage.resetToSeed();
            await loadCounts();
            Alert.alert('Pronto', 'Protocolo restaurado ao padrão.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ajustes e Backup</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{counts.peptides}</Text>
            <Text style={styles.statLabel}>peptídeos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{counts.logs}</Text>
            <Text style={styles.statLabel}>registros</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{counts.training}</Text>
            <Text style={styles.statLabel}>treinos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.hint}>
          Seus dados ficam salvos neste aparelho. Exporte um arquivo para não
          perder o histórico ao trocar de celular ou limpar o navegador.
        </Text>

        <Button title="Exportar backup" onPress={handleExport} style={{ marginTop: 8 }} />
        <Button
          title={showImport ? 'Cancelar importação' : 'Importar backup'}
          variant="secondary"
          onPress={() => setShowImport((s) => !s)}
          style={{ marginTop: 10 }}
        />

        {showImport && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.hint}>Cole abaixo o conteúdo do arquivo de backup:</Text>
            <TextInput
              style={styles.importInput}
              value={importText}
              onChangeText={setImportText}
              placeholder='{"version":1,...}'
              placeholderTextColor={colors.text.secondary}
              multiline
            />
            <Button title="Restaurar dados" onPress={handleImport} style={{ marginTop: 10 }} />
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Zona de risco</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh" size={18} color={colors.error} />
          <Text style={styles.resetText}>Restaurar protocolo padrão</Text>
        </TouchableOpacity>
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
  topTitle: { ...typography.headline, color: colors.text.primary },
  content: { padding: 16, paddingBottom: 60 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.title, color: colors.text.primary },
  statLabel: { ...typography.small, color: colors.text.secondary, marginTop: 2 },
  sectionTitle: {
    ...typography.headline,
    color: colors.text.primary,
    marginBottom: 6,
  },
  hint: { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },
  importInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text.primary,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    ...typography.caption,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 24 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  resetText: { ...typography.body, color: colors.error, fontWeight: '600' },
});

export default AjustesScreen;
