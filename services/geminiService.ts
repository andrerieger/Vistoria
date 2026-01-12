import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    throw new Error("Chave de API não configurada.");
  }
  return new GoogleGenAI({ apiKey });
};

// Analyze an image to identify defects and conditions
export const analyzeInspectionImage = async (base64Image: string, context: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Using gemini-3-pro-preview as requested for high quality image reasoning
    const modelId = "gemini-3-pro-preview"; 
    
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity from canvas/input
              data: cleanBase64
            }
          },
          {
            text: `Você é um especialista em vistorias imobiliárias.
            Analise esta imagem focando no item: "${context}".
            Descreva o estado de conservação, identifique materiais (ex: madeira, cerâmica) e aponte explicitamente qualquer dano, mancha, risco ou defeito visível.
            Seja técnico, direto e profissional. Responda em português do Brasil.`
          }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for better detail detection
      }
    });

    return response.text || "Não foi possível analisar a imagem.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Erro ao conectar com a IA para análise de imagem.";
  }
};

// Refine text descriptions (e.g., from rough voice-to-text notes)
export const refineDescription = async (roughText: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // Using flash for text speed
    const modelId = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Melhore o seguinte texto de uma vistoria imobiliária, tornando-o mais formal, corrigindo gramática e mantendo os detalhes técnicos. Texto original: "${roughText}"`,
    });

    return response.text || roughText;
  } catch (error) {
    console.error("Error refining text:", error);
    return roughText; // Fallback to original
  }
};
