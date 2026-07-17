"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartProps {
  data: { date: string; count: number }[];
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="oklch(0.75 0.12 80)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="oklch(0.75 0.12 80)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
        />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(0.08 0 0)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(v) =>
            new Date(v).toLocaleDateString("en", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="oklch(0.75 0.12 80)"
          strokeWidth={2}
          fill="url(#leadGradient)"
          name="Leads"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
