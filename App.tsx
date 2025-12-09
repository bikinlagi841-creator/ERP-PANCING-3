import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBasket, 
  PackageSearch, 
  Settings, 
  MessageSquareText, 
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

// Components
import { SalesChart, CategoryChart } from './components/DashboardCharts';
import { ProductCategory, Product, Sale, CartItem, SalesPrediction, InventoryInsight, ChatMessage } from './types';
import * as GeminiService from './services/geminiService';

// --- MOCK DATA ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Shimano Stella SW', sku: 'SH-ST-SW-10000', category: ProductCategory.REEL, price: 1099.99, cost: 800, stock: 5, minStockLevel: 3, imageUrl: 'https://picsum.photos/200', description: 'Premium saltwater spinning reel.', salesLastMonth: 12 },
  { id: '2', name: 'Daiwa Saltiga 2023', sku: 'DA-SL-23', category: ProductCategory.REEL, price: 999.00, cost: 750, stock: 8, minStockLevel: 4, imageUrl: 'https://picsum.photos/201', description: 'Heavy duty expansive reel.', salesLastMonth: 8 },
  { id: '3', name: 'G.Loomis NRX+ Rod', sku: 'GL-NRX-843', category: ProductCategory.ROD, price: 625.00, cost: 400, stock: 2, minStockLevel: 5, imageUrl: 'https://picsum.photos/202', description: 'Sensitive bass fishing rod.', salesLastMonth: 20 },
  { id: '4', name: 'Rapala X-Rap', sku: 'RP-XR-10', category: ProductCategory.LURE, price: 12.99, cost: 6, stock: 150, minStockLevel: 50, imageUrl: 'https://picsum.photos/203', description: 'Slashbait lure.', salesLastMonth: 200 },
  { id: '5', name: 'PowerPro Braid 30lb', sku: 'PP-BR-30', category: ProductCategory.LINE, price: 29.99, cost: 15, stock: 40, minStockLevel: 20, imageUrl: 'https://picsum.photos/204', description: 'Spectra fiber braided line.', salesLastMonth: 45 },
];

const INITIAL_SALES: Sale[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `sale-${i}`,
  date: new Date(Date.now() - i * 86400000).toISOString(),
  total: Math.floor(Math.random() * 500) + 50,
  items: [] 
})).reverse();


// --- COMPONENTS ---

// 1. SIDEBAR
const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-500 p-2 rounded-lg">
           <TrendingUp size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">HookLine<span className="text-brand-500">ERP</span></h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Operations</div>
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link to="/pos" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/pos')}`}>
          <ShoppingBasket size={20} /> Point of Sale
        </Link>
        <Link to="/inventory" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/inventory')}`}>
          <PackageSearch size={20} /> Inventory
        </Link>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">Intelligence</div>
        <Link to="/ai-insights" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/ai-insights')}`}>
          <BrainCircuit size={20} /> AI Insights
        </Link>
        <Link to="/assistant" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/assistant')}`}>
          <MessageSquareText size={20} /> Assistant
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-2 w-full transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

// 2. DASHBOARD PAGE
const Dashboard = ({ sales, products }: { sales: Sale[], products: Product[] }) => {
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockLevel).length;

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Real-time overview of your tackle shop.</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200">
           <img src="https://picsum.photos/40" className="w-8 h-8 rounded-full" alt="Profile" />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">${totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4 font-medium">+12.5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm font-medium text-slate-500">Products in Stock</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{products.length} <span className="text-sm text-slate-400 font-normal">SKUs</span></h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <PackageSearch size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">{lowStockCount}</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xs text-red-500 mt-4 font-medium">Action recommended</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h4>
          <SalesChart sales={sales} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Top Categories</h4>
          <CategoryChart sales={sales} />
        </div>
      </div>
    </div>
  );
};

// 3. POS PAGE
const PointOfSale = ({ products, onCheckout }: { products: Product[], onCheckout: (items: CartItem[]) => void }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen overflow-hidden">
       {/* Product Grid */}
       <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
            <input 
              type="text" 
              placeholder="Search rods, reels..." 
              className="px-4 py-2 rounded-lg border border-slate-300 w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} 
                   onClick={() => addToCart(product)}
                   className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 cursor-pointer hover:border-brand-500 hover:shadow-md transition-all group">
                <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                   <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   {product.stock <= product.minStockLevel && (
                     <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">LOW STOCK</span>
                   )}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm truncate">{product.name}</h3>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-brand-600 font-bold">${product.price}</span>
                  <span className="text-xs text-slate-400">{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
       </div>

       {/* Cart Sidebar */}
       <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-20">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Current Order</h2>
            <p className="text-xs text-slate-400">Order #88392</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {cart.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <ShoppingBasket size={48} className="mb-2 opacity-20" />
                  <p>Cart is empty</p>
               </div>
             ) : (
               cart.map(item => (
                 <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <img src={item.imageUrl} className="w-12 h-12 rounded-md object-cover bg-white" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-brand-600 font-semibold">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">-</button>
                       <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600">+</button>
                    </div>
                 </div>
               ))
             )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
             <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-slate-500">
                   <span>Subtotal</span>
                   <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                   <span>Tax (8%)</span>
                   <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                   <span>Total</span>
                   <span>${total.toFixed(2)}</span>
                </div>
             </div>
             <button 
               onClick={() => {
                 onCheckout(cart);
                 setCart([]);
               }}
               disabled={cart.length === 0}
               className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-slate-900/10 flex justify-center items-center gap-2"
             >
               Confirm Payment <Check size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};

// 4. INVENTORY & AI PAGE
const Inventory = ({ products }: { products: Product[] }) => {
  const [insights, setInsights] = useState<InventoryInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await GeminiService.analyzeInventory(products);
    setInsights(result);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-900">Inventory & AI Insights</h2>
         <button 
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
         >
           {loading ? <span className="animate-spin text-xl">◌</span> : <BrainCircuit size={20} />}
           Run AI Analysis
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                 <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cost/Price</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {products.map(p => (
                 <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} className="w-10 h-10 rounded bg-slate-100 object-cover" />
                        <div>
                          <p className="font-medium text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">{p.stock}</td>
                    <td className="px-6 py-4">
                      {p.stock <= p.minStockLevel ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Low Stock</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       ${p.cost} / ${p.price}
                    </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* AI Insights Panel */}
        <div className="space-y-4">
           {loading && (
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
             </div>
           )}

           {!loading && insights.length === 0 && (
             <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
                <BrainCircuit size={48} className="mx-auto text-purple-300 mb-3" />
                <h3 className="text-purple-900 font-semibold">No insights yet</h3>
                <p className="text-purple-700 text-sm mt-1">Click the button to let Gemini analyze your stock levels and sales velocity.</p>
             </div>
           )}

           {insights.map((insight, idx) => (
             <div key={idx} className={`p-5 rounded-xl border shadow-sm ${
               insight.priority === 'HIGH' ? 'bg-red-50 border-red-100' : 
               insight.priority === 'MEDIUM' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'
             }`}>
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800">{insight.productName}</h4>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      insight.action === 'RESTOCK' ? 'bg-red-200 text-red-800' : 
                      insight.action === 'DISCOUNT' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'
                   }`}>{insight.action}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{insight.reason}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// 5. AI SALES PREDICTION
const AIPredictions = ({ sales }: { sales: Sale[] }) => {
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      const data = await GeminiService.predictSales(sales);
      setPredictions(data);
      setLoading(false);
    };
    fetchPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
     <div className="p-8 max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <TrendingUp size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">AI Sales Forecasting</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Powered by Gemini. We analyze your historical transaction data to predict future revenue trends.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {predictions.map((pred, idx) => (
               <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg shadow-indigo-100 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <h3 className="text-xl font-bold text-slate-900">{pred.month}</h3>
                  <div className="my-4">
                    <span className="text-3xl font-bold text-indigo-600">${pred.predictedRevenue.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 block mt-1">Projected Revenue</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{pred.reasoning}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 p-2 rounded">
                    <span>Confidence Score:</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500" style={{ width: `${pred.confidence * 100}%` }}></div>
                    </div>
                    <span>{Math.round(pred.confidence * 100)}%</span>
                  </div>
               </div>
             ))}
          </div>
        )}
     </div>
  );
};

// 6. AI CHAT ASSISTANT
const AssistantPage = ({ products }: { products: Product[] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I\'m Finley, your expert fishing guide. How can I help you find the perfect gear today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const responseText = await GeminiService.chatWithAssistant(messages, userMsg.text, products);
    
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <MessageSquareText className="text-brand-600" /> Finley AI Assistant
         </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-200' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about rods, reels, or fishing conditions..." 
            className="flex-1 border border-slate-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <TrendingUp className="rotate-90" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP LAYOUT WRAPPER ---
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen">
       <Sidebar />
       {/* Mobile Header */}
       <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white p-4 z-50 flex justify-between items-center">
          <span className="font-bold">HookLineERP</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
       </div>
       
       {/* Mobile Sidebar Overlay */}
       {sidebarOpen && (
         <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
           <div className="w-64 h-full bg-slate-900 p-4 pt-20" onClick={e => e.stopPropagation()}>
             {/* Reusing links manually for mobile simplicity */}
             <div className="flex flex-col gap-4 text-slate-300">
               <Link to="/" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
               <Link to="/pos" onClick={() => setSidebarOpen(false)}>POS</Link>
               <Link to="/inventory" onClick={() => setSidebarOpen(false)}>Inventory</Link>
             </div>
           </div>
         </div>
       )}

       <main className="flex-1 md:ml-64 transition-all duration-300 pt-16 md:pt-0">
         <Outlet />
       </main>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);

  // Handle fake checkout
  const handleCheckout = (items: CartItem[]) => {
    const total = items.reduce((sum, i) => sum + (i.price * i.quantity * 1.08), 0);
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
      total,
      items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price }))
    };

    setSales(prev => [...prev, newSale]);
    
    // Reduce Stock
    setProducts(prev => prev.map(p => {
      const soldItem = items.find(i => i.id === p.id);
      return soldItem ? { ...p, stock: p.stock - soldItem.quantity } : p;
    }));
  };

  return (
    <HashRouter>
       <Routes>
         <Route element={<Layout />}>
           <Route path="/" element={<Dashboard sales={sales} products={products} />} />
           <Route path="/pos" element={<PointOfSale products={products} onCheckout={handleCheckout} />} />
           <Route path="/inventory" element={<Inventory products={products} />} />
           <Route path="/ai-insights" element={<AIPredictions sales={sales} />} />
           <Route path="/assistant" element={<AssistantPage products={products} />} />
         </Route>
         <Route path="*" element={<Navigate to="/" replace />} />
       </Routes>
    </HashRouter>
  );
};

export default App;