import {
  StatusBar,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useCallback, useState, useEffect } from "react";
import { WeatherIconName, Location, WeatherData } from "@/types/weather";
import WeatherIcon from "@/components/WeatherIcon";
import ScrollView = Animated.ScrollView;
import { debounce } from 'lodash';
import { fetchLocation, fetchWeatherForecast } from "@/app/(api)/weatherApi";
import { weatherCodeToIcon, getDayOfWeek } from "@/utils/weatherUtils";

export default function WeatherScreen() {
  const [toggleSearch, setToggleSearch] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [weatherCondition, setWeatherCondition] = useState<WeatherIconName>("day-cloudy");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleLocationSelect({ name: "London", country: "UK", id: "default" });
  }, []);

  const handleLocationSelect = async (location: Location) => {
    try {
      setLoading(true);
      setError(null);
      setToggleSearch(false);

      const weather = await fetchWeatherForecast({
        cityName: location.name,
        days: 7
      });

      if (weather) {
        setWeatherData(weather);
        setWeatherCondition(weatherCodeToIcon(weather.current.condition.code));
      }
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    try {
      setLoading(true);
      setError(null);

      if (value.length > 2) {
        const data = await fetchLocation({ cityName: value });
        if (data) {
          const transformedLocations = data.map((item: any) => ({
            name: item.name,
            country: item.country,
            id: item.id || `${item.name}-${item.country}`
          }));
          setLocations(transformedLocations);
        }
      } else {
        setLocations([]);
      }
    } catch (err) {
      setError("Failed to fetch locations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  if (loading && !weatherData) {
    return (
        <View className="flex-1 justify-center items-center bg-blue-200">
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
    );
  }

  return (
      <View className="flex-1 relative">
        <StatusBar />
        <SafeAreaView className="flex-1 bg-blue-300">
          {/* Search Section */}
          <View className="mx-4 relative z-50">
            <View
                className={`flex-row justify-end items-center rounded-full ${
                    toggleSearch ? 'bg-gray-700' : 'bg-transparent'
                }`}
            >
              {toggleSearch ? (
                  <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder="Search city"
                      placeholderTextColor="lightgray"
                      className="pl-6 h-10 flex-1 text-base text-white"
                  />
              ) : null}

              <TouchableOpacity
                  className="rounded-full p-3 m-1 bg-gray-700"
                  onPress={() => setToggleSearch(!toggleSearch)}
              >
                <FontAwesome6
                    name="magnifying-glass"
                    size={25}
                    color="lightgray"
                />
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            {locations.length > 0 && toggleSearch ? (
                <View className="absolute w-full bg-white top-16 rounded-3xl">
                  {locations.map((loc, index) => (
                      <TouchableOpacity
                          key={loc.id}
                          onPress={() => handleLocationSelect(loc)}
                          className={`flex-row items-center p-4 ${
                              index !== locations.length - 1 ? 'border-b border-gray-200' : ''
                          }`}
                      >
                        <FontAwesome6 name="location-dot" size={24} color="gray" />
                        <Text className="ml-3 text-gray-800">
                          {loc.name}, {loc.country}
                        </Text>
                      </TouchableOpacity>
                  ))}
                </View>
            ) : null}
          </View>

          {/* Weather Info Section */}
          {weatherData && (
              <ScrollView
                  className="mx-4 flex-1"
                  showsVerticalScrollIndicator={false}
              >
                {/* Location and Time */}
                <View className="mt-4 flex flex-row items-start">
                  <View className="mr-8">
                    <Text className="text-4xl font-bold text-gray-800">
                      {weatherData.location.name}
                    </Text>
                    <Text className="text-lg text-gray-600">
                      {weatherData.location.region}, {weatherData.location.country}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-2">
                      Last updated: {weatherData.current.last_updated}
                    </Text>
                  </View>
                </View>

                {/* Current Weather */}
                <View className="flex flex-row mt-6 justify-around">
                  <View className="">
                    <View className="static">
                      <Text className="text-8xl font-bold text-gray-800 mt-4 mr-10">
                        {Math.round(weatherData.current.temp_c)}°
                      </Text>
                      <View className="absolute bottom-0 right-0">
                        {weatherData.current.condition.icon && (
                            <Image
                                source={{ uri: `https:${weatherData.current.condition.icon}` }}
                                className="h-24 w-24"
                            />
                        )}
                      </View>

                    </View>
                  </View>
                  <View>
                    <Text className="text-xl text-gray-600 mt-2 capitalize">
                      {weatherData.current.condition.text}
                    </Text>
                    <Text className="text-gray-500 mt-1">
                      Feels like {Math.round(weatherData.current.feelslike_c)}°C
                    </Text>
                  </View>
                </View>

                {/* Forecast Section */}
                {weatherData.forecast && (
                    <View className="mt-6 mb-6">
                      <Text className="text-gray-800 font-semibold ml-4 mb-2">
                        7-Day Forecast
                      </Text>
                      <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="px-2"
                      >
                        {weatherData.forecast.forecastday.map((day, index) => (
                            <View
                                key={day.date}
                                className="items-center bg-white/30 rounded-3xl py-3 px-3 mr-4"
                            >

                              {day.day.condition.icon && (
                                  <Image
                                      source={{ uri: `https:${day.day.condition.icon}` }}
                                      className=""
                                      style={{ width: 72, height: 72 }} // Explicit dimensions for Image
                                  />
                              )}
                              <Text className="text-gray-800 font-medium  mb-1">
                                {index === 0 ? 'Today' : getDayOfWeek(day.date)}
                              </Text>
                              <Text className="text-gray-800 font-semibold">
                                {Math.round(day.day.avgtemp_c)}°
                              </Text>
                            </View>
                        ))}
                      </ScrollView>
                    </View>
                )}

                {/* Detailed Stats */}
                <View className="bg-white/30 rounded-3xl p-4 mt-4 mb-4">
                  <View className="flex-row justify-between flex-wrap">
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <WeatherIcon name="windy" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">Wind</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.wind_kph} km/h {weatherData.current.wind_dir}
                      </Text>
                    </View>
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <WeatherIcon name="day-rain" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">Humidity</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.humidity}%
                      </Text>
                    </View>
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <FontAwesome6 name="eye" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">Visibility</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.vis_km} km
                      </Text>
                    </View>
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <FontAwesome6 name="gauge-high" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">Pressure</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.pressure_mb} mb
                      </Text>
                    </View>
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <FontAwesome6 name="sun" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">UV Index</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.uv}
                      </Text>
                    </View>
                    <View className="w-1/2 p-2">
                      <View className="flex-row items-center">
                        <FontAwesome6 name="cloud" size={20} color="#666" />
                        <Text className="ml-2 text-gray-600">Cloud Cover</Text>
                      </View>
                      <Text className="text-gray-800 font-semibold mt-1">
                        {weatherData.current.cloud}%
                      </Text>
                    </View>
                  </View>
                </View>


              </ScrollView>
          )}

          {error && (
              <Text className="text-red-500 text-center mt-4">{error}</Text>
          )}
        </SafeAreaView>
      </View>
  );
}