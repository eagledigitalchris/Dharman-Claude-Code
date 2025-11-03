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
}

export const WaterLogModal: React.FC<WaterLogModalProps> = ({
  visible,
  onClose,
  onLog,
}) => {
  const handleLog = (ml: number) => {
    onLog(ml);
    onClose();
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
            <Text style={styles.title}>💧 Adicionar Água</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Quanto você bebeu?</Text>

          <View style={styles.buttonGroup}>
            <Button
              title="+ 250 ml"
              onPress={() => handleLog(250)}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="+ 500 ml"
              onPress={() => handleLog(500)}
              variant="outline"
              style={styles.button}
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button
              title="+ 750 ml"
              onPress={() => handleLog(750)}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="+ 1000 ml"
              onPress={() => handleLog(1000)}
              variant="outline"
              style={styles.button}
            />
          </View>

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
    marginBottom: 16,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  closeButton: {
    marginTop: 12,
  },
});
