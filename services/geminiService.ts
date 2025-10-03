
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { analysisSchema, AnalysisResult } from '../types';

const PROMPT = `Please analyze the provided image of a liver tissue slide. Identify key pathological features and provide a structured report. Your analysis should include: 
1. An overall impression. 
2. A list of key findings (e.g., steatosis, inflammation, fibrosis, ballooning, Mallory-Denk bodies). 
3. A differential diagnosis based on the findings. 
4. Recommendations for further tests or investigations.
Provide your response in the requested JSON format.`;

export const analyzeLiverSlide = async (base64ImageData: string, mimeType: string): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: PROMPT,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        const result: AnalysisResult = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};