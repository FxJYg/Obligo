import { GoogleGenAI, Type } from "@google/genai";
import { Currency } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize properly with the options object
const ai = new GoogleGenAI({ apiKey });

export const evaluateTaskWorth = async (
  title: string,
  description: string,
  currency: string
): Promise<{ worth: number; reason: string; summary: string }> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return { 
        worth: 10, 
        reason: "Default estimation (No API Key)", 
        summary: title.split(' ').slice(0, 3).join(' ') 
    };
  }

  try {
    const prompt = `
      Evaluate the "worth" or "penalty value" of the following task in ${currency}.
      The value represents the monetary penalty someone should pay to a shared bank if they fail to do it.
      
      Also, provide a "summary": a very short version of the title (max 2-3 words) suitable for a small calendar pill.
      Example: "Pay Electricity Bill" -> "Pay Electric". "Clean the entire kitchen" -> "Kitchen Clean".

      Task Title: "${title}"
      Task Description: "${description}"
      
      Return a JSON object with 'worth' (number), 'reason' (short string), and 'summary' (string).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            worth: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ['worth', 'reason', 'summary']
        }
      }
    });

    const text = response.text;
    if (text) {
        return JSON.parse(text);
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Gemini evaluation failed:", error);
    return { 
        worth: 5, 
        reason: "AI evaluation failed, default value applied.",
        summary: title.split(' ').slice(0, 3).join(' ')
    };
  }
};