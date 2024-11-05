import { WeatherIconName } from "@/types/weather";

export const weatherCodeToIcon = (code: number): WeatherIconName => {
    // WeatherAPI.com condition codes to our WeatherIcon mapping
    const codeMapping: { [key: number]: WeatherIconName } = {
        1000: "day-sunny", // Clear
        1003: "day-cloudy", // Partly cloudy
        1063: "day-rain", // Patchy rain possible
        // Add more mappings as needed
    };

    return codeMapping[code] || "day-cloudy";
};

export const getDayOfWeek = (dateStr: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateStr);
    return days[date.getDay()];
};