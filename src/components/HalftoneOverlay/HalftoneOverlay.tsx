import { View, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_W } = Dimensions.get('window');

const HalftoneOverlay: React.FC<{ color?: string; dotColor?: string; size?: number }> = ({
  color = 'transparent',
  dotColor = 'rgba(0,0,0,0.06)',
  size = 8,
}) => {
  const cols = Math.ceil(SCREEN_W / size) + 2;
  const rows = 18; 
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <View
              key={c}
              style={{
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: size,
                  backgroundColor: dotColor,
                }}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default HalftoneOverlay;