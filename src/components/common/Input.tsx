import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.text.secondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: colors.text.primary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  },
});
