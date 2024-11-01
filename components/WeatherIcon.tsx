// components/WeatherIcon.tsx

import React from "react";
import { View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { WeatherIconProps } from "@/types/weather";

const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  size = 200,
  color = "#666",
  className = "",
}) => {
  const iconMap: { [key: string]: string } = {
    // Day icons
    "day-sunny": "weather-sunny",
    "day-cloudy": "weather-partly-cloudy",
    "day-cloudy-gusts": "weather-windy-variant",
    "day-cloudy-windy": "weather-windy",
    "day-fog": "weather-fog",
    "day-hail": "weather-hail",
    "day-haze": "weather-hazy",
    "day-lightning": "weather-lightning",
    "day-rain": "weather-rainy",
    "day-rain-mix": "weather-partly-rainy",
    "day-rain-wind": "weather-pouring",
    "day-showers": "weather-partly-rainy",
    "day-sleet": "weather-snowy-rainy",
    "day-sleet-storm": "weather-snowy-heavy",
    "day-snow": "weather-snowy",
    "day-snow-thunderstorm": "weather-snowy-heavy",
    "day-snow-wind": "weather-snowy-rainy",
    "day-sprinkle": "weather-partly-rainy",
    "day-storm-showers": "weather-lightning-rainy",
    "day-sunny-overcast": "weather-partly-cloudy",
    "day-thunderstorm": "weather-lightning",
    "day-windy": "weather-windy",

    // Night icons
    "night-clear": "weather-night",
    "night-alt-cloudy": "weather-night-partly-cloudy",
    "night-alt-cloudy-gusts": "weather-night-windy",
    "night-alt-cloudy-windy": "weather-night-windy",
    "night-alt-hail": "weather-hail",
    "night-alt-lightning": "weather-night-lightning",
    "night-alt-rain": "weather-night-rainy",
    "night-alt-rain-mix": "weather-night-partly-rainy",
    "night-alt-rain-wind": "weather-night-rainy",
    "night-alt-showers": "weather-night-partly-rainy",
    "night-alt-sleet": "weather-snowy-rainy",
    "night-alt-sleet-storm": "weather-snowy-heavy",
    "night-alt-snow": "weather-snowy",
    "night-alt-snow-thunderstorm": "weather-snowy-heavy",
    "night-alt-snow-wind": "weather-snowy-rainy",
    "night-alt-sprinkle": "weather-night-partly-rainy",
    "night-alt-storm-showers": "weather-night-lightning-rainy",
    "night-alt-thunderstorm": "weather-night-lightning",

    // Neutral icons
    cloudy: "weather-cloudy",
    "cloudy-gusts": "weather-windy",
    "cloudy-windy": "weather-windy",
    fog: "weather-fog",
    hail: "weather-hail",
    lightning: "weather-lightning",
    rain: "weather-rainy",
    "rain-mix": "weather-rainy",
    "rain-wind": "weather-pouring",
    showers: "weather-rainy",
    sleet: "weather-snowy-rainy",
    snow: "weather-snowy",
    sprinkle: "weather-partly-rainy",
    "storm-showers": "weather-lightning-rainy",
    thunderstorm: "weather-lightning",
    "snow-wind": "weather-snowy-heavy",
    smog: "weather-fog",
    smoke: "smoke",
    dust: "weather-hazy",
    "snowflake-cold": "snowflake",
    windy: "weather-windy",
    "strong-wind": "weather-windy",
    celsius: "temperature-celsius",
    fahrenheit: "temperature-fahrenheit",
  };

  const iconName = iconMap[name] || "help-circle-outline";

  return (
    <View className={className}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </View>
  );
};

export default WeatherIcon;
