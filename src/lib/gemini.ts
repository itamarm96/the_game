import { GoogleGenAI } from "@google/genai";

// Ensure the API key exists if running on the server
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateContent = async (systemInstruction: string, prompt: string) => {
  if (!ai) {
    throw new Error("Gemini API key is missing. Please add GEMINI_API_KEY to your .env.local file.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.65,
        responseMimeType: "application/json",
      },
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content.");
  }
};
