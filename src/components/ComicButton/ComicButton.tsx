import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';

const ComicButton: React.FC<{
  label: string;
  onPress: () => void;
  bg?: string;
  color?: string;
  shadowColor?: string;
  style?: object;
}> = ({
  label,
  onPress,
  bg = "#FFD600",
  color = "#1A1028",
  shadowColor = "#1A1028",
  style,
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={1}
    >
      {/* Hard ink shadow offset layer */}
      <View
        style={[
          {
            backgroundColor: shadowColor,
            borderRadius: 4,
            position: 'absolute',
            top: pressed ? 3 : 5,
            left: pressed ? 3 : 5,
            right: pressed ? -3 : -5,
            bottom: pressed ? -3 : -5,
          },
        ]}
      />
      <Animated.View
        style={[
          {
            backgroundColor: bg,
            borderWidth: 3,
            borderColor: "#1A1028",
            borderRadius: 4,
            paddingVertical: 15,
            paddingHorizontal:  24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontFamily: 'Bangers_400Regular',
            fontSize: pressed ? 19 : 18,
            letterSpacing: 2,
            color,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ComicButton;