"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ChartData {
  name: string;
  total: number;
}

interface ChartsProps {
  revenueData: ChartData[];
  categoryData: { name: string; value: number }[];
}

import { useState, useEffect } from "react";

export function DashboardCharts({ revenueData, categoryData }: ChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm h-[400px] animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Carregando gráfico de faturamento...
        </div>
        <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm h-[400px] animate-pulse flex items-center justify-center text-muted-foreground text-sm">
          Carregando gráfico de categorias...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      {/* Gráfico de Faturamento */}
      <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-foreground">Fluxo de Faturamento</h4>
          <p className="text-xs text-muted-foreground">Evolução do faturamento diário / mensal</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(139, 92, 246)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="rgb(139, 92, 246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(9, 9, 11, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [`R$ ${value}`, "Faturamento"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="rgb(139, 92, 246)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Vendas por Categoria */}
      <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-foreground">Vendas por Categoria</h4>
          <p className="text-xs text-muted-foreground">Distribuição física de saídas do estoque</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(9, 9, 11, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [value, "Vendidos"]}
              />
              <Bar
                dataKey="value"
                fill="rgb(99, 102, 241)"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
