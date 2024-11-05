import axios from "axios";

// Define types for parameters
interface WeatherParams {
    cityName: string;
    days?: number;
}

// Define the API endpoints as functions to properly handle parameters
const getForecastEndpoint = (params: WeatherParams): string =>
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&q=${params.cityName}&days=${params.days || 1}&aqi=no&alerts=no`;

const getLocationEndpoint = (params: Pick<WeatherParams, 'cityName'>): string =>
    `https://api.weatherapi.com/v1/search.json?key=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}&q=${params.cityName}`;

const apiCall = async (endpoint: string) => {
    const options = {
        method: 'GET',
        url: endpoint,
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        // Enhanced error logging
        if (axios.isAxiosError(error)) {
            console.log('API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        } else {
            console.log('Unexpected error:', error);
        }
        return null;
    }
};

// Make sure to properly export these functions
export const fetchWeatherForecast = async (params: WeatherParams) => {
    // Set a default value for days if not provided
    const daysParam = {
        ...params,
        days: params.days || 7
    };
    return apiCall(getForecastEndpoint(daysParam));
};

export const fetchLocation = async (params: Pick<WeatherParams, 'cityName'>) => {
    return apiCall(getLocationEndpoint(params));
};

// You can also export a default object if needed
const weatherApi = {
    fetchWeatherForecast,
    fetchLocation
};

export default weatherApi;