import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Product } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are 'Veda', an expert AI Fashion Stylist for 'Vastra AI', a luxury saree boutique.
Your goal is to help customers choose the perfect saree based on their occasion, body type, skin tone, and personal preferences.
You are knowledgeable about Indian fabrics (Banarasi, Kanjeevaram, Chiffon, etc.), draping styles, and jewelry pairing.
Keep your tone elegant, helpful, and culturally appreciative.
If a user uploads an image, analyze it to suggest matching jewelry or similar sarees from a general fashion perspective (you don't need to match specific database IDs unless generic).
Keep responses concise (under 100 words) unless detailed advice is requested.
`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const generateStylingAdvice = async (
  chat: Chat, 
  message: string, 
  imageBase64?: string
): Promise<string> => {
  try {
    let content: any = { role: 'user', parts: [] };
    
    // The @google/genai Chat.sendMessage usually takes a string or parts. 
    // Let's use the parts structure if an image is present.
    const payload: any = { message: message };
    
    if (imageBase64) {
        payload.message = {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64
                    }
                },
                {
                    text: message
                }
            ]
        }
    }

    const response: GenerateContentResponse = await chat.sendMessage(payload);
    return response.text || "I apologize, I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting to the fashion archives right now. Please try again.";
  }
};

// Helper to convert URL to Base64 for Gemini
const getBase64FromUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to fetch image for Gemini:", error);
    return null;
  }
};

export const generateProductStyleGuide = async (product: Product): Promise<string> => {
  try {
    // Randomize the tone slightly to ensure description changes every time page reloads
    const tones = ["poetic", "bold", "sophisticated", "traditional", "chic"];
    const randomTone = tones[Math.floor(Math.random() * tones.length)];

    const parts: any[] = [];

    // 1. Try to add the image
    const imageBase64 = await getBase64FromUrl(product.image);
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64
            }
        });
    }

    // 2. Add the prompt
    const prompt = `
      Look at this saree image and its title: "${product.name}".
      
      Generate a ${randomTone}, emoji-rich description specifically describing the visual details seen in the image (colors, patterns, borders) and the vibe of the title.
      
      Include:
      - A visual description of the saree.
      - A styling tip (jewelry/hair).
      - An occasion suggestion.

      Do not use headers. Write it as a cohesive paragraph or bullet points. Keep it under 100 words.
    `;
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        temperature: 1.2, // High temperature for creativity
      }
    });

    return response.text || "Description currently unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};
