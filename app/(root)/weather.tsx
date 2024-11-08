import {
  StatusBar,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { useCallback, useState, useEffect } from "react";
import {WeatherIconName, WeatherData, LocationType} from "@/types/weather";
import WeatherIcon from "@/components/WeatherIcon";
import ScrollView = Animated.ScrollView;
import { debounce } from 'lodash';
import { fetchLocation, fetchWeatherForecast } from "@/app/(api)/weatherApi";
import { weatherCodeToIcon, getDayOfWeek } from "@/utils/weatherUtils";
import {getData, storeData} from "@/utils/asyncStorage";
import * as Location from 'expo-location';
import {getAISuggestions2} from "@/app/(api)/geminiApi";

const LAST_LOCATION_KEY = 'lastLocation';
const WEATHER_DATA_KEY = 'weatherData';
const LOCATION_PERMISSION_KEY = 'locationPermissionAsked';

export default function WeatherScreen() {
  const [toggleSearch, setToggleSearch] = useState<boolean>(false);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [weatherCondition, setWeatherCondition] = useState<WeatherIconName>("day-cloudy");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<any>()
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<string | null>(null);

  useEffect(() => {
    const determineTimeOfDay = () => {
      const hours = new Date().getHours();

      if (hours >= 5 && hours < 12) return "morning";
      if (hours >= 12 && hours < 17) return "afternoon";
      if (hours >= 17 && hours < 21) return "evening";
      return "night";
    };

    setTimeOfDay(determineTimeOfDay());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await requestLocationAndInitialize();
      } catch (error) {
        console.error("Error initializing location:", error);
      }
    })();
  }, []);


  const requestLocationAndInitialize = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High // This is sufficient for weather data
        });


        const weather = await fetchWeatherForecast({
          cityName: `${location.coords.latitude},${location.coords.longitude}`
        });

        if (weather) {
          const currentLocation: LocationType = {
            name: weather.location.name,
            country: weather.location.country,
            id: `${weather.location.name}-${weather.location.country}`,
          };

          setWeatherData(weather);
          setWeatherCondition(weatherCodeToIcon(weather.current.condition.code));

          // Save to AsyncStorage
          await storeData(LAST_LOCATION_KEY, JSON.stringify(currentLocation));
          await storeData(WEATHER_DATA_KEY, JSON.stringify(weather));
          await storeData(LOCATION_PERMISSION_KEY, 'true');

          //Get AI suggestions
          const suggestions = await getAISuggestions2({
            location: `${currentLocation.name}, ${currentLocation.country}`,
            weather: {
              temp_c: weather.current.temp_c,
              condition: weather.current.condition.text,
            },
            timeOfDay: timeOfDay || 'day',
          });
          setAISuggestions(suggestions);
        }

      } else {

        console.log('Location permission denied');
        Alert.alert(
            "Location Access Denied",
            "We'll show you the weather for Dar es Salaam instead. You can always search for your city manually.",
            [{ text: "OK" }]
        );
        await handleLocationSelect({name: "Dar es Salaam", country: "Tanzania", id: "default"});
      }
    } catch (err) {
      console.error('Error getting location:', err);
      setError("Unable to get location. Showing default city.");
      await handleLocationSelect({name: "London", country: "UK", id: "default"});
    } finally {
      setLoading(false);
    }
  };


  // const isDataStale = (data: WeatherData): boolean => {
  //   if (!data.current.last_updated) return true;
  //   const lastUpdate = new Date(data.current.last_updated).getTime();
  //   const now = new Date().getTime();
  //   const thirtyMinutes = 30 * 60 * 1000;
  //   return now - lastUpdate > thirtyMinutes;
  // };

  const handleLocationSelect = async (location: LocationType) => {
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

        // Save to AsyncStorage
        await storeData(LAST_LOCATION_KEY, JSON.stringify(location));
        await storeData(WEATHER_DATA_KEY, JSON.stringify(weather));

        // Get AI suggestions
        const suggestions = await getAISuggestions2({
          location: `${location.name}, ${location.country}`,
          weather: {
            temp_c: weather.current.temp_c,
            condition: weather.current.condition.text,
          },
          timeOfDay: timeOfDay || 'day',
        });
        setAISuggestions(suggestions);
        console.log('the suggestion', suggestions)

      }
    } catch (err) {
      setError("Failed to fetch weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const savedLocation = await getData(LAST_LOCATION_KEY);
      if (savedLocation) {
        await handleLocationSelect(JSON.parse(savedLocation));
      } else {
        await handleLocationSelect({ name: "London", country: "UK", id: "default" });
      }
    } catch (err) {
      console.error('Error refreshing:', err);
      setError("Failed to refresh weather data");
    } finally {
      setRefreshing(false);
    }
  }, []);

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


  const getHourFromTime = (time: string) => {
    const date = new Date(time);
    return date.getHours().toString().padStart(2, '0') + ':00';
  };

  const filterHourlyForecast = (forecastDay: ForecastDay) => {
    const currentHour = new Date().getHours();
    return forecastDay.hour?.filter((hour) => {
      const hourTime = new Date(hour.time).getHours();
      return hourTime >= currentHour;
    }) || [];
  };

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
                    toggleSearch ? 'bg-blue-800' : 'bg-transparent'
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
                  className="rounded-full p-3 m-1 bg-blue-900"
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
                <View className="absolute w-full bg-white top-16 rounded-2xl">
                  {locations.map((loc, index) => (
                      <TouchableOpacity
                          key={loc.id}
                          onPress={() => handleLocationSelect(loc)}
                          className={`flex-row items-center p-4 ${
                              index !== locations.length - 1 ? 'border-b border-gray-200' : ''
                          }`}
                      >
                        <FontAwesome6 name="location-dot" size={24} color="gray" />
                        <Text className="ml-3 text-blue-950">
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
                  refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4A90E2"
                        colors={["#4A90E2"]}
                    />
                  }
              >
                {/* Location and Time */}
                <View className="mt-4 ml-4 mb-2 flex flex-row items-start">
                  <View className="mr-8">
                    <Text className="text-4xl font-bold text-blue-950">
                      {weatherData.location.name}
                    </Text>
                    <Text className="text-lg font-semibold text-gray-600">
                      {weatherData.location.region}, {weatherData.location.country}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Last updated: {weatherData.current.last_updated}
                    </Text>
                  </View>
                </View>

                {/* Current Weather */}
                <View className="flex flex-row mt-6 justify-around">
                  <Text className="text-blue-950 font-semibold text-xl ml-4 mb-2  ">
                    Now
                  </Text>
                  <View className="">
                    <View className="static">
                      <Text className="text-8xl font-bold text-blue-950 mt-4 mr-10">
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
                    <Text className="text-xl text-gray-600 font-semibold mt-2 capitalize">
                      {weatherData.current.condition.text}
                    </Text>
                    <Text className="text-gray-500 font-semibold mt-1">
                      Feels like {Math.round(weatherData.current.feelslike_c)}°C
                    </Text>
                  </View>
                </View>
                {/*AI suggestion*/}
                <View className="mt-4 ml-2">
                  <Text className="text-blue-950 font-semibold ml-1  ">
                    BlueSky AI suggestion
                  </Text>
                  <View className=" bg-white/30 rounded-2xl p-4 mt-2 mb-2 ">
                    <Text className="text-blue-950 font-medium ">
                      {aiSuggestions}
                    </Text>
                  </View>
                </View>

                {/*Hourly Forecast*/}
                {weatherData.forecast && weatherData.forecast.forecastday[0].hour && (
                    <View className="mt-6">
                      <Text className="text-blue-950 font-semibold ml-4 mb-2">
                        Hourly Forecast
                      </Text>
                      <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="p-2 bg-white/30 rounded-2xl"
                      >
                        {[
                          ...filterHourlyForecast(weatherData.forecast.forecastday[0]),
                          ...(weatherData.forecast.forecastday[1]?.hour || [])
                        ]
                            .slice(0, 24)
                            .map((hour, index) => (
                                <View
                                    key={hour.time}
                                    className="items-center rounded-2xl py-2 px-2 mr-4"
                                >
                                  <Text className="text-blue-950 font-semibold">
                                    {Math.round(hour.temp_c)}°
                                  </Text>
                                  {hour.condition.icon && (
                                      <Image
                                          source={{ uri: `https:${hour.condition.icon}` }}
                                          className=""
                                          style={{ width: 62, height: 64 }}
                                      />
                                  )}

                                  <Text className="text-blue-950 font-medium mb-1">
                                    {index === 0 ? 'Now' : getHourFromTime(hour.time)}
                                  </Text>
                                </View>
                            ))}
                      </ScrollView>
                    </View>
                )}


                {/* Forecast Section */}
                {weatherData.forecast && (
                    <View className="mt-6 mb-6">
                      <Text className="text-blue-950 font-semibold ml-4 mb-2">
                        7-Day Forecast
                      </Text>
                      <View className="mx-2">
                        {weatherData.forecast.forecastday.map((day, index) => (
                            <View
                                key={day.date}
                                className={`
            flex-row justify-between items-center bg-white/30 px-4 py-3 mb-1
            ${index === 0 ? 'rounded-t-2xl' : ''}
            ${index === weatherData.forecast.forecastday.length - 1 ? 'rounded-b-2xl' : ''}
            ${index !== weatherData.forecast.forecastday.length - 1 ? 'border-b border-white/20' : ''}
          `}
                            >
                              {/* Day */}
                              <View className="flex-1">
                                <Text className="text-blue-950 font-medium">
                                  {index === 0 ? 'Today' : getDayOfWeek(day.date)}
                                </Text>
                              </View>

                              {/* Weather Icon */}
                              <View className="flex-row items-center flex-1 justify-center">
                                {day.day.condition.icon && (
                                    <Image
                                        source={{ uri: `https:${day.day.condition.icon}` }}
                                        style={{ width: 40, height: 40 }}
                                    />
                                )}
                              </View>

                              {/* Temperature and additional info */}
                              <View className="flex-1 items-end">
                                <View className="flex-row items-center">
                                  <Text className="text-blue-950 font-semibold">
                                    {Math.round(day.day.maxtemp_c)}°
                                  </Text>
                                  <Text className="text-blue-950 font-semibold">
                                    /
                                  </Text>
                                  <Text className="text-gray-600 ml-1">
                                    {Math.round(day.day.mintemp_c)}°
                                  </Text>
                                </View>
                                <View className="flex-row items-center mt-1">
                                  <FontAwesome6
                                      name="droplet"
                                      size={12}
                                      color="#4A90E2"
                                      className="mr-1"
                                  />
                                  <Text className="text-gray-600 text-sm">
                                    {day.day.daily_chance_of_rain}%
                                  </Text>
                                </View>
                              </View>
                            </View>
                        ))}
                      </View>
                    </View>
                )}

                {/* Current Stats */}
                <View>
                  <Text className="text-blue-950 font-semibold ml-4">
                    Current Conditions
                  </Text>
                  <View className="bg-white/30 rounded-2xl p-4 mt-4 mb-4">
                    <View className="flex-row justify-between flex-wrap">
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <WeatherIcon name="windy" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">Wind</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.wind_kph} km/h {weatherData.current.wind_dir}
                        </Text>
                      </View>
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <WeatherIcon name="day-rain" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">Humidity</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.humidity}%
                        </Text>
                      </View>
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <FontAwesome6 name="eye" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">Visibility</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.vis_km} km
                        </Text>
                      </View>
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <FontAwesome6 name="gauge-high" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">Pressure</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.pressure_mb} mb
                        </Text>
                      </View>
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <FontAwesome6 name="sun" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">UV Index</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.uv}
                        </Text>
                      </View>
                      <View className="w-1/2 p-2">
                        <View className="flex-row items-center">
                          <FontAwesome6 name="cloud" size={20} color="#666" />
                          <Text className="ml-2 text-gray-600">Cloud Cover</Text>
                        </View>
                        <Text className="text-blue-950 font-semibold mt-1">
                          {weatherData.current.cloud}%
                        </Text>
                      </View>
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