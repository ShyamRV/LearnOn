import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from "../utils/audioUtils";

// Initialize Gemini Client
// Note: In a real production app, API keys should be handled via a backend proxy.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the document and generate a simplified script.
 */
export const generateScriptFromDocument = async (
  fileBase64: string,
  mimeType: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are LearnOn_AI, an advanced educational content creator. 
      I have attached a document (PDF or PPT). 
      
      Your task:
      1. Analyze the content of the document thoroughly.
      2. Identify the core concepts, main arguments, and key takeaways.
      3. Write a "LearnOn Audio Guide" script summarizing this content. 
      
      The script should:
      - Be written in a conversational, engaging, and clear tone (like a smart tutor explaining to a student).
      - Be highly suitable for listening (TTS friendly).
      - Simplify complex concepts with easy analogies.
      - Have a brief intro welcoming the listener to LearnOn, body paragraphs explaining key points, and a motivating conclusion.
      - Be approximately 400-600 words long to provide depth.
      - DO NOT include cues like [Music] or Speaker labels. Just the spoken text.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No script generated.");
    return text;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze document. Please ensure the file is a valid PDF or PPT and try again.");
  }
};

/**
 * Step 2: Convert the generated script into Audio using Gemini TTS.
 */
export const generateAudioFromScript = async (script: string): Promise<AudioBuffer> => {
  try {
    const model = 'gemini-2.5-flash-preview-tts';
    
    // We clean the script slightly to ensure no markdown remains that might be read literally
    const cleanScript = script.replace(/\*\*/g, '').replace(/###/g, '');

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [{ text: cleanScript }],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Fenrir, Kore, Puck, Charon, Zephyr
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(p => p.inlineData);
    
    if (!audioPart || !audioPart.inlineData?.data) {
      throw new Error("No audio data returned from Gemini.");
    }

    const base64Audio = audioPart.inlineData.data;
    const audioBytes = decodeBase64(base64Audio);
    
    // Decode raw PCM into an AudioBuffer for playback
    return await decodeAudioData(audioBytes);
    
  } catch (error: any) {
    console.error("TTS Error:", error);
    throw new Error(`Failed to generate audio from script: ${error.message || 'Unknown error'}`);
  }
};