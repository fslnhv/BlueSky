// types/weather.ts

export type WeatherIconName =
  | "day-sunny"
  | "day-cloudy"
  | "day-cloudy-gusts"
  | "day-cloudy-windy"
  | "day-fog"
  | "day-hail"
  | "day-haze"
  | "day-lightning"
  | "day-rain"
  | "day-rain-mix"
  | "day-rain-wind"
  | "day-showers"
  | "day-sleet"
  | "day-sleet-storm"
  | "day-snow"
  | "day-snow-thunderstorm"
  | "day-snow-wind"
  | "day-sprinkle"
  | "day-storm-showers"
  | "day-sunny-overcast"
  | "day-thunderstorm"
  | "day-windy"
  | "night-clear"
  | "night-alt-cloudy"
  | "night-alt-cloudy-gusts"
  | "night-alt-cloudy-windy"
  | "night-alt-hail"
  | "night-alt-lightning"
  | "night-alt-rain"
  | "night-alt-rain-mix"
  | "night-alt-rain-wind"
  | "night-alt-showers"
  | "night-alt-sleet"
  | "night-alt-sleet-storm"
  | "night-alt-snow"
  | "night-alt-snow-thunderstorm"
  | "night-alt-snow-wind"
  | "night-alt-sprinkle"
  | "night-alt-storm-showers"
  | "night-alt-thunderstorm"
  | "cloudy"
  | "cloudy-gusts"
  | "cloudy-windy"
  | "fog"
  | "hail"
  | "lightning"
  | "rain"
  | "rain-mix"
  | "rain-wind"
  | "showers"
  | "sleet"
  | "snow"
  | "sprinkle"
  | "storm-showers"
  | "thunderstorm"
  | "snow-wind"
  | "smog"
  | "smoke"
  | "dust"
  | "snowflake-cold"
  | "windy"
  | "strong-wind"
  | "celsius"
  | "fahrenheit";

export interface WeatherIconProps {
  name: WeatherIconName;
  size?: number;
  color?: string;
  className?: string;
}


export interface Location {
  name: string;
  country: string;
  id: string;
}

export interface WeatherCondition {
  code: number;
  icon: string;
  text: string;
}

export interface CurrentWeather {
  cloud: number;
  condition: WeatherCondition;
  dewpoint_c: number;
  dewpoint_f: number;
  feelslike_c: number;
  feelslike_f: number;
  gust_kph: number;
  gust_mph: number;
  heatindex_c: number;
  heatindex_f: number;
  humidity: number;
  is_day: number;
  last_updated: string;
  last_updated_epoch: number;
  precip_in: number;
  precip_mm: number;
  pressure_in: number;
  pressure_mb: number;
  temp_c: number;
  temp_f: number;
  uv: number;
  vis_km: number;
  vis_miles: number;
  wind_degree: number;
  wind_dir: string;
  wind_kph: number;
  wind_mph: number;
  windchill_c: number;
  windchill_f: number;
}

export interface Location {
  country: string;
  lat: number;
  localtime: string;
  localtime_epoch: number;
  lon: number;
  name: string;
  region: string;
  tz_id: string;
}

export interface ForecastDay {
  date: string;
  day: {
    avgtemp_c: number;
    avgtemp_f: number;
    condition: WeatherCondition;
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
    daily_will_it_rain: number;
    daily_will_it_snow: number;
    maxwind_kph: number;
    maxwind_mph: number;
    totalprecip_in: number;
    totalprecip_mm: number;
    totalsnow_cm: number;
    avgvis_km: number;
    avgvis_miles: number;
    avghumidity: number;
    uv: number;
  };
  astro?: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: string;
  };
  hour?: Array<{
    time: string;
    temp_c: number;
    temp_f: number;
    condition: WeatherCondition;
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    windchill_c: number;
    windchill_f: number;
    heatindex_c: number;
    heatindex_f: number;
    dewpoint_c: number;
    dewpoint_f: number;
    will_it_rain: number;
    chance_of_rain: number;
    will_it_snow: number;
    chance_of_snow: number;
    vis_km: number;
    vis_miles: number;
    gust_mph: number;
    gust_kph: number;
    uv: number;
  }>;
}

export interface WeatherData {
  current: CurrentWeather;
  location: Location;
  forecast?: {
    forecastday: ForecastDay[];
  };
}