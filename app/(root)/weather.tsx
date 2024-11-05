// screens/WeatherScreen.tsx

import {
  StatusBar,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  StyleSheet, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";

import { WeatherIconName } from "@/types/weather";
import WeatherIcon from "@/components/WeatherIcon";
import {CalendarDaysIcon} from "@heroicons/react/16/solid";
import ScrollView = Animated.ScrollView;

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
              style={styles.searchIcon}
              className={"rounded-full p-3 pr-3 m-1 bg-gray-700"}
              onPress={() => setToggleSearch(!toggleSearch)}
            >
              <FontAwesome6
                name="magnifying-glass"
                size={25}
                color="lightgray"
              />
            </TouchableOpacity>
          </View>

          {location.length > 0 && toggleSearch ? (
            <View>
              {location.map((loc, index) => {
                const showBorder = index + 1 !== location.length;
                const borderClass = showBorder
                  ? "border-b-2 border-b-gray-400"
                  : "";

                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}
                  >
                    <FontAwesome6 name="location-dot" size={24} color="black" />
                    <Text className="ml-2 text-lg text-black">
                      London, United Kingdom
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {/*forecast section*/}
        <View className="mx-4 flex justify-around flex-1 mb-2">
          {/*location*/}
          <Text className="text-gray-800 text-center text-2xl font-bold">
            London,
            <Text className="text-lg font-semibold text-gray-500">
              United Kingdom
            </Text>
          </Text>

          {/*weather icon*/}
          <View className="flex-row justify-center items-center">
            <WeatherIcon
              name={weatherCondition}
              size={196}
              color="#666"
              className="h-52 w-52"
            />
          </View>

          {/*temperature and additional info*/}
          <View className="space-y-2">
            <View>
              <Text className="text-center text-6xl font-bold text-gray-800">
                {temperature}°
              </Text>
              <Text className="text-center text-xl text-gray-500 capitalize">
                {weatherCondition.replace(/-/g, " ")}
              </Text>
              {/*<WeatherIcon name="celsius" size={24} color="#666" className="" />*/}
            </View>
          </View>
          {/*other stats*/}
          <View className="flex-row justify-between mx-4">
            <View className="flex-row space-x-4 items-center">
              <WeatherIcon
                name={"windy"}
                color="#666"
                size={20}
                className="h-6 w-6"
              />
              <Text className="text-gray-500 font-semibold text-base">
                22km
              </Text>
            </View>
            <View className="flex-row space-x-2 items-center">
              <WeatherIcon
                name={"day-rain"}
                color="#666"
                size={20}
                className="h-6 w-6"
              />
              <Text className="text-gray-500 font-semibold text-base">23%</Text>
            </View>
            <View className="flex-row space-x-2 items-center">
              <WeatherIcon
                name={"day-sunny"}
                color="#666"
                size={20}
                className="h-6 w-6"
              />
              <Text className="text-gray-500 font-semibold text-base">
                6:05AM
              </Text>
            </View>
          </View>
        </View>
        {/*forecast for the next days*/}
        <View className="mb-2  space-y-3">
          <View className="flex-row items-center mx-5 space-x-2">
            <FontAwesome6 name="calendar-days" size={22} color="gray" className="ml-2" />
            <Text className="text-gray-500 text-base ml-2">Daily forecast</Text>
          </View>
          <ScrollView horizontal contentContainerStyle={{paddingHorizontal:15}} showsHorizontalScrollIndicator={false} className="my-4">
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Monday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Tuesday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Wednesday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Thursday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Friday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Saturday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
            <View className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 border border-gray-300">
              <WeatherIcon name='day-rain' size={24} color="gray" className="h-11 w-11"/>
              <Text className="text-gray-500  text-base">Sunday</Text>
              <Text className="text-gray-500 font-semibold text-xl">{temperature}°</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}