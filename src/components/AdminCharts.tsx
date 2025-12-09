import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subDays, isSameDay } from "../utils/dateUtils";
import { formatWeekday } from "../utils/formatters";
import type { BookingAdminResponse } from "../types/apiTypes";

interface AdminChartsProps {
  bookings: BookingAdminResponse[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const AdminCharts = ({ bookings }: AdminChartsProps) => {
  const barData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        date: d,
        name: formatWeekday(d), // <--- Uses browser locale (Seg/Tue/etc)
        count: 0,
      };
    });

    bookings.forEach((b) => {
      const bookingDate = new Date(b.start_time);
      const dayStat = last7Days.find((d) => isSameDay(d.date, bookingDate));
      if (dayStat) dayStat.count += 1;
    });

    return last7Days;
  }, [bookings]);

  const pieData = useMemo(() => {
    const typeCounts: Record<string, number> = {};

    bookings.forEach((b) => {
      const type = b.spaces?.type
        ? b.spaces.type
            .replace("_", " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "Other";

      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.keys(typeCounts).map((key) => ({
      name: key,
      value: typeCounts[key],
    }));
  }, [bookings]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* BAR CHART */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bookings (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* PIE CHART */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
