export enum ProductCategory {
  ROD = 'ROD',
  REEL = 'REEL',
  LINE = 'LINE',
  LURE = 'LURE',
  ACCESSORY = 'ACCESSORY',
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStockLevel: number; // For alert
  imageUrl: string;
  description: string;
  salesLastMonth: number; // Mock data for AI
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  total: number;
  items: { productId: string; name: string; quantity: number; price: number }[];
  customerName?: string;
}

export interface SalesPrediction {
  month: string;
  predictedRevenue: number;
  confidence: number;
  reasoning: string;
}

export interface InventoryInsight {
  productId: string;
  productName: string;
  action: 'RESTOCK' | 'DISCOUNT' | 'HOLD';
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
