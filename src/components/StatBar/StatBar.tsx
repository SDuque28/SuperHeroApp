import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(value / 100, { duration: 800, easing: Easing.out(Easing.quad) });
  }, [value, barWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <Animated.View style={[styles.statBarFill, { backgroundColor: color }, barStyle]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    statRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.5)',
    width: 30,
    textTransform: 'uppercase',
  },
  statBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    width: 26,
    textAlign: 'right',
  },
});

export default StatBar;