import { useEffect, useState } from "react";
import { bookingService, spaceService } from "../services/api";
import type { BookingAdminResponse, SpaceWithFloor } from "../types/apiTypes"; // <--- FIXED IMPORT
import { toast } from "sonner";
import { downloadCSV } from "../utils/exportUtils";
import {
  formatDate,
  formatTimeRange,
  formatFriendlyDate,
} from "../utils/formatters";

import { DashboardStats } from "../components/DashboardStats";
import { ActivityFeed } from "../components/ActivityFeed";
import { AdminCharts } from "../components/AdminCharts";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Trash2,
  Loader2,
  ShieldAlert,
  CalendarDays,
  MapPin,
  Download,
} from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingAdminResponse[]>([]);
  const [spaces, setSpaces] = useState<SpaceWithFloor[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<
    BookingAdminResponse[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    const res = bookings.filter(
      (b) =>
        (b.spaces?.name || "").toLowerCase().includes(lower) ||
        (b.profiles?.email || "").toLowerCase().includes(lower)
    );
    setFilteredBookings(res);
  }, [search, bookings]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allBookings, allSpaces] = await Promise.all([
        bookingService.getAllAdmin(),
        spaceService.getAllGlobal(),
      ]);
      setBookings(allBookings);
      setFilteredBookings(allBookings);
      setSpaces(allSpaces);
    } catch (e) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await bookingService.cancel(id);
      toast.success("Booking deleted permanently");
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      toast.error("Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    if (filteredBookings.length === 0) return toast.error("No data to export");
    downloadCSV(
      filteredBookings,
      `cajuhub_bookings_${new Date().toISOString().split("T")[0]}`
    );
    toast.success("Export started");
  };

  const isRoomOccupiedNow = (spaceName: string) => {
    const now = new Date();
    return bookings.some(
      (b) =>
        b.spaces?.name === spaceName &&
        new Date(b.start_time) <= now &&
        new Date(b.end_time) >= now
    );
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-[1400px] px-4 space-y-8">
      <DashboardStats bookings={bookings} />
      <AdminCharts bookings={bookings} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Tabs defaultValue="list" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="list">All Bookings List</TabsTrigger>
                <TabsTrigger value="agenda">Room Agenda View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list">
              <Card className="shadow-md">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-primary" />
                      Booking Log
                    </CardTitle>
                    <CardDescription>
                      Master record of all system reservations.
                    </CardDescription>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search user or room..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-24 text-center text-muted-foreground"
                            >
                              No bookings found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBookings.map((b) => {
                            const isPast = new Date(b.end_time) < new Date();
                            return (
                              <TableRow
                                key={b.id}
                                className="hover:bg-muted/10"
                              >
                                <TableCell className="font-medium">
                                  {b.profiles?.email}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {b.spaces?.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {b.spaces?.type?.replace("_", " ")}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(b.start_time)}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {formatTimeRange(b.start_time, b.end_time)}
                                </TableCell>
                                <TableCell>
                                  {isPast ? (
                                    <Badge
                                      variant="outline"
                                      className="text-muted-foreground"
                                    >
                                      Completed
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-green-600 border-0">
                                      Active
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:text-red-600 hover:bg-red-50"
                                        disabled={deletingId === b.id}
                                      >
                                        {deletingId === b.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Force Delete Booking?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will immediately remove the
                                          booking for{" "}
                                          <strong>{b.profiles?.email}</strong>.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(b.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {spaces.map((space) => {
                  const isOccupied = isRoomOccupiedNow(space.name);
                  const roomBookings = bookings
                    .filter((b) => b.spaces?.name === space.name)
                    .filter((b) => new Date(b.end_time) > new Date())
                    .sort(
                      (a, b) =>
                        new Date(a.start_time).getTime() -
                        new Date(b.start_time).getTime()
                    )
                    .slice(0, 5);

                  return (
                    <Card
                      key={space.id}
                      className={`border-t-4 ${
                        isOccupied ? "border-t-red-500" : "border-t-green-500"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {space.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {space.floors?.name || "Unknown Floor"}
                            </CardDescription>
                          </div>
                          {isOccupied ? (
                            <Badge
                              variant="destructive"
                              className="animate-pulse"
                            >
                              Occupied Now
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200 bg-green-50"
                            >
                              Available
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          Upcoming Schedule
                        </h4>

                        <ScrollArea className="h-[150px] w-full rounded border p-2 bg-muted/20">
                          {roomBookings.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-8">
                              No upcoming bookings found.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {roomBookings.map((rb) => (
                                <div
                                  key={rb.id}
                                  className="flex justify-between items-center text-sm bg-background p-2 rounded shadow-sm border"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium text-xs">
                                      {formatFriendlyDate(rb.start_time)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeRange(
                                        rb.start_time,
                                        rb.end_time
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className="text-xs font-medium block truncate max-w-[100px]"
                                      title={rb.profiles?.email}
                                    >
                                      {rb.profiles?.email.split("@")[0]}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
