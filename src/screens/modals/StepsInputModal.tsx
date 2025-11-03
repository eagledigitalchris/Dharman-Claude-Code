import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { pt_BR } from '../../constants/translations';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface StepsInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (steps: number) => void;
  currentSteps?: number;
}

export const StepsInputModal: React.FC<StepsInputModalProps> = ({
  visible,
  onClose,
  onSave,
  currentSteps = 0,
}) => {
  const [steps, setSteps] = useState(currentSteps.toString());

  const handleSave = () => {
    const stepsNumber = parseInt(steps, 10);
    if (!isNaN(stepsNumber) && stepsNumber >= 0) {
      onSave(stepsNumber);
      onClose();
    }
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
            <Text style={styles.title}>👟 Atualizar Passos</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Input
            label="Número de passos"
            placeholder="8000"
            keyboardType="number-pad"
            value={steps}
            onChangeText={setSteps}
          />

          <View style={styles.buttonRow}>
            <Button
              title={pt_BR.common.cancel}
              onPress={onClose}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title={pt_BR.common.save}
              onPress={handleSave}
              disabled={!steps || parseInt(steps, 10) < 0}
              style={styles.button}
            />
          </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
  },
});
