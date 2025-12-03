import { GoogleGenAI, Modality } from "@google/genai";
import { FileData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = 'gemini-2.5-flash';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Step 1: Analyze the document and generate a podcast script.
 */
export const analyzeDocument = async (file: FileData): Promise<string> => {
  try {
    const prompt = `
      You are an expert educational tutor and podcast host. 
      Your task is to read the attached document and create a conversational, 
      engaging audio script that summarizes the key concepts.
      
      Rules:
      1. Tone: Friendly, clear, and slightly enthusiastic. Like a favorite teacher explaining a topic.
      2. Structure: Start with a brief hook, explain the core concepts simply (using analogies if possible), and end with a quick takeaway.
      3. Content: Focus on the "Big Ideas". Don't just list facts; connect them.
      4. Format: Return ONLY the raw text to be spoken. Do not include speaker labels (like "Host:"), stage directions, or markdown formatting like **bold**. Just the spoken words.
      5. Length: Keep it under 300 words for a concise lesson.
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: file.type,
              data: file.base64
            }
          }
        ]
      }
    });

    if (!response.text) {
      throw new Error("No script generated.");
    }

    return response.text;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

/**
 * Step 2: Convert the script to audio using Gemini TTS.
 * Returns the base64 encoded raw PCM data.
 */
export const synthesizeAudio = async (script: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: {
        parts: [{ text: script }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Fenrir' // Deep, calm voice suitable for education
            }
          }
        }
      }
    });

    // Extract inline audio data
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("No audio data received from Gemini.");
    }

    return audioData;

  } catch (error) {
    console.error("Synthesis Error:", error);
    throw error;
  }
};