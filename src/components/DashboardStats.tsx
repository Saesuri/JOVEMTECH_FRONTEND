import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, CalendarCheck } from "lucide-react";
import type { BookingAdminResponse } from "../types/apiTypes";

interface DashboardStatsProps {
  bookings: BookingAdminResponse[];
}

export const DashboardStats = ({ bookings }: DashboardStatsProps) => {
  // 1. Calculate Total
  const totalBookings = bookings.length;

  // 2. Calculate Active Now
  const now = new Date();
  const activeNow = bookings.filter((b) => {
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    return now >= start && now <= end;
  }).length;

  // 3. Calculate Unique Users
  const uniqueUsers = new Set(bookings.map((b) => b.profiles?.email)).size;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBookings}</div>
          <p className="text-xs text-muted-foreground">All-time reservations</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Happening Now</CardTitle>
          <Activity className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeNow}</div>
          <p className="text-xs text-muted-foreground">
            Meetings currently in progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueUsers}</div>
          <p className="text-xs text-muted-foreground">
            Employees using the system
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
