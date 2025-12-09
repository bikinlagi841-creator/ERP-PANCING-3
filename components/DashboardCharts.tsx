import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Sale } from '../types';

interface DashboardChartsProps {
  sales: Sale[];
}

export const SalesChart: React.FC<DashboardChartsProps> = ({ sales }) => {
  // Aggregate sales by date (last 7 entries for demo)
  const data = sales.slice(-10).map(s => ({
    name: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    total: s.total,
    items: s.items.length
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`$${value}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart: React.FC<{sales: Sale[]}> = ({ sales }) => {
    // Mock category distribution based on sales
    const data = [
        { name: 'Rods', value: 4000 },
        { name: 'Reels', value: 3000 },
        { name: 'Lures', value: 2000 },
        { name: 'Lines', value: 1000 },
    ];

    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
            <XAxis type="number" stroke="#64748b" fontSize={12} hide />
            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={60} tickLine={false} axisLine={false}/>
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
}
