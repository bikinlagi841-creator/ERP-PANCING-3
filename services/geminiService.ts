import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Product, Sale, SalesPrediction, InventoryInsight, ChatMessage } from "../types";

// Initialize Gemini Client
// In a real Vercel app, this key comes from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_FLASH = 'gemini-2.5-flash';

/**
 * AI Sales Prediction using historical data
 */
export const predictSales = async (salesHistory: Sale[]): Promise<SalesPrediction[]> => {
  try {
    const recentSales = salesHistory.slice(-50); // Analyze last 50 transactions
    const salesSummary = recentSales.map(s => ({ date: s.date, total: s.total }));
    
    const prompt = `
      Analyze the following sales data (date and total revenue) for a fishing tackle shop.
      Predict the sales trend for the next 3 months.
      Return a JSON array with month name, predicted revenue, confidence score (0-1), and a short reasoning string.
      
      Data: ${JSON.stringify(salesSummary)}
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          month: { type: Type.STRING },
          predictedRevenue: { type: Type.NUMBER },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["month", "predictedRevenue", "confidence", "reasoning"]
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SalesPrediction[];
    }
    return [];
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return [];
  }
};

/**
 * AI Inventory Optimization
 */
export const analyzeInventory = async (products: Product[]): Promise<InventoryInsight[]> => {
  try {
    const stockData = products.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStockLevel,
      lastMonthSales: p.salesLastMonth
    }));

    const prompt = `
      You are an inventory manager AI. Analyze this fishing tackle inventory.
      Identify items that need restocking (stock < minStock or high sales), items that are overstocked/slow-moving (high stock, low sales), and items that are fine.
      Return a JSON array of insights.
      
      Inventory Data: ${JSON.stringify(stockData)}
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productId: { type: Type.STRING },
          productName: { type: Type.STRING },
          action: { type: Type.STRING, enum: ['RESTOCK', 'DISCOUNT', 'HOLD'] },
          reason: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
        },
        required: ["productId", "productName", "action", "reason", "priority"]
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InventoryInsight[];
    }
    return [];
  } catch (error) {
    console.error("AI Inventory Error:", error);
    return [];
  }
};

/**
 * AI Chat Assistant for Product Knowledge
 */
export const chatWithAssistant = async (history: ChatMessage[], currentMessage: string, availableProducts: Product[]) => {
  try {
    // We create a concise product catalog context
    const catalog = availableProducts.map(p => `${p.name} ($${p.price}) - ${p.category} - Stock: ${p.stock}`).join('\n');
    
    const systemInstruction = `
      You are 'Finley', an expert fishing guide and shop assistant for 'HookLineSinker'.
      You help customers choose the right gear based on their target fish and conditions.
      You have access to the current shop inventory:
      ---
      ${catalog}
      ---
      Only recommend items in stock. Be friendly, concise, and helpful.
    `;

    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage }]
    });

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 300, 
      }
    });

    return response.text || "I'm having trouble checking the tackle box right now. Try again?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I lost my train of thought. Please check your connection.";
  }
}
