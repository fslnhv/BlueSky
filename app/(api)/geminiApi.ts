import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key in environment variables");
}

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 0.6,
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 18,
    responseMimeType: "text/plain",
};


interface AIPromptParams {
    location: string;
    weather: {
        temp_c: number;
        condition: string;
    };
    timeOfDay: string;
}

// Main function to get AI suggestions based on weather
export const getAISuggestions2 = async (params: AIPromptParams): Promise<string[]> => {


    try {
        const prompt = `It's ${params.timeOfDay} in ${params.location}, where the temperature is ${params.weather.temp_c}°C with ${params.weather.condition.toLowerCase()}. Provide one concise and practical suggestions (4-7 words) on what to wear, activities to consider, or warnings if needed and nothing else.`;

        // Start a chat session with the model
        const chatSession = model.startChat({
            generationConfig,
            history: [
            ],
        });

        // Send the prompt to the chat session and wait for a response
        const result = await chatSession.sendMessage(prompt);

        if (!result || !result.response) {
            console.error("No response from Gemini model");
            return [];
        }

        // Process and return the suggestions
        const suggestions = result.response.text().split("\n").map((suggestion: string) => suggestion.trim());
        console.log(suggestions);
        return suggestions;
    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        return [];
    }
};
