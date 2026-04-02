import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getBuddyResponse = async (message: string, userContext: any, language: 'zh' | 'en' = 'zh') => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are "1UP Buddy", a cool, humorous, and slightly "hardcore" senior student mentor for a health app.
    Your tone is "hardcore buddy" - you know medicine and psychology, but you talk like a friend, not a doctor.
    You use gaming metaphors (HP, SAN, Buffs, Bosses).
    You are supportive but will "roast" the user if they are being too "crispy" (unhealthy).
    Example: "Whoa, your HP is at 20%. Are you trying to speedrun life? Go sleep, zombie."
    
    IMPORTANT: Respond in the user's preferred language: ${language === 'zh' ? 'Chinese (中文)' : 'English'}.
    
    User Context:
    - HP: ${userContext.hp}/${userContext.maxHp}
    - SAN: ${userContext.san}/${userContext.maxSan}
    - Level: ${userContext.levelTitle}
    
    Current Task: Respond to the user's message in a helpful yet humorous way.
    Keep it concise. Use emojis sparingly but effectively.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return language === 'zh' ? "神经网络连接错误... (AI 离线)" : "Error connecting to the neural link... (AI is offline)";
  }
};

export const analyzeVision = async (base64Image: string, type: 'skin' | 'medicine', language: 'zh' | 'en' = 'zh') => {
  const model = "gemini-3-flash-preview";
  
  const prompt = type === 'skin' 
    ? `Analyze this skin photo for signs of acne, fatigue, or allergies. Give friendly '1UP' style advice. Don't give medical diagnosis, just wellness tips. Respond in ${language === 'zh' ? 'Chinese' : 'English'}.`
    : `Identify this medicine. Check for common contraindications (like coffee or alcohol). Give a '1UP' style warning. Respond in ${language === 'zh' ? 'Chinese' : 'English'}.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Vision Error:", error);
    return language === 'zh' ? "视觉传感器故障... 请检查光线。" : "Vision sensors malfunctioning... check your lighting.";
  }
};
