import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { pt_BR } from '../../constants/translations';
import { Button } from '../../components/common/Button';

interface WaterLogModalProps {
  visible: boolean;
  onClose: () => void;
  onLog: (ml: number) => void;
  currentTotal: number;
  goalTotal: number;
}

export const WaterLogModal: React.FC<WaterLogModalProps> = ({
  visible,
  onClose,
  onLog,
  currentTotal,
  goalTotal,
}) => {
  const handleLog = () => {
    onLog(500);
    // NÃO fecha o modal, deixa o usuário adicionar mais
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>💧 Registro de Água</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total de Hoje</Text>
            <Text style={styles.totalValue}>
              {currentTotal.toLocaleString('pt-BR')} / {goalTotal.toLocaleString('pt-BR')} ml
            </Text>
          </View>

          <Button
            title="+ 500 ml"
            onPress={handleLog}
            variant="primary"
            style={styles.addButton}
          />

          <Button
            title={pt_BR.common.close}
            onPress={onClose}
            variant="secondary"
            style={styles.closeButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalContainer: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  totalValue: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '700',
  },
  addButton: {
    marginBottom: 12,
    minHeight: 60,
  },
  closeButton: {
    marginTop: 4,
  },
});
