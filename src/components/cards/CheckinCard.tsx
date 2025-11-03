import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

interface CheckinCardProps {
  beforePhotos: {
    front: string;
    side: string;
    back: string;
  };
  afterPhotos: {
    front: string;
    side: string;
    back: string;
  };
  beforeDate: string;
  afterDate: string;
  period: string;
  onCompare: () => void;
  onShare: () => void;
}

export const CheckinCard: React.FC<CheckinCardProps> = ({
  beforePhotos,
  afterPhotos,
  beforeDate,
  afterDate,
  period,
  onCompare,
  onShare,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.comparisonRow}>
        <View style={styles.photoSection}>
          <Text style={styles.dateLabel}>{beforeDate}</Text>
          <View style={styles.photoRow}>
            <Image source={{ uri: beforePhotos.front }} style={styles.thumbnail} />
            <Image source={{ uri: beforePhotos.side }} style={styles.thumbnail} />
            <Image source={{ uri: beforePhotos.back }} style={styles.thumbnail} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.photoSection}>
          <Text style={styles.dateLabel}>{afterDate}</Text>
          <View style={styles.photoRow}>
            <Image source={{ uri: afterPhotos.front }} style={styles.thumbnail} />
            <Image source={{ uri: afterPhotos.side }} style={styles.thumbnail} />
            <Image source={{ uri: afterPhotos.back }} style={styles.thumbnail} />
          </View>
        </View>
      </View>

      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{period}</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={onCompare}>
          <Text style={styles.buttonIcon}>📊</Text>
          <Text style={styles.buttonText}>Comparar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onShare}>
          <Text style={styles.buttonIcon}>🔗</Text>
          <Text style={styles.buttonText}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoSection: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: 50,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.progress.empty,
    marginHorizontal: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: colors.progress.filled,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  buttonText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
