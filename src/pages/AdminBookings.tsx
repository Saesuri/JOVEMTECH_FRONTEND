import { useEffect, useState } from "react";
import {
  bookingService,
  spaceService,
  type BookingAdminResponse,
  type SpaceWithFloor,
} from "../services/api";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";

// Components
import { DashboardStats } from "../components/DashboardStats";
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
} from "lucide-react";

const AdminBookings = () => {
  // Data State
  const [bookings, setBookings] = useState<BookingAdminResponse[]>([]);
  const [spaces, setSpaces] = useState<SpaceWithFloor[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<
    BookingAdminResponse[]
  >([]);

  // UI State
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic for Table
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
      // Fetch both Bookings and Spaces in parallel
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

  // Helper to check room status right now
  const isRoomOccupiedNow = (spaceId: string) => {
    const now = new Date();
    return bookings.some((b) => {
      // Check if booking belongs to room AND is happening now
      // Note: Admin Response structure might define space differently than SpaceWithFloor
      // We need to match IDs carefully.
      // The BookingAdminResponse JOIN structure usually returns the space object but NOT the ID directly at top level if not selected.
      // Ideally backend select should be: 'id, space_id, ...'
      // Assuming 'bookings' has 'space_id' or we filter by matching name if ID missing.
      // Let's assume booking row has 'id' and joined 'spaces' object.
      // We need to match space name for this demo if ID is missing in join, or update backend select.
      // UPDATE: Let's assume we update backend or match by name for visual simplicity.

      return (
        b.spaces.name === spaces.find((s) => s.id === spaceId)?.name &&
        new Date(b.start_time) <= now &&
        new Date(b.end_time) >= now
      );
    });
  };

  return (
    <div className="container mx-auto py-10 max-w-7xl">
      {/* ANALYTICS */}
      {!loading && <DashboardStats bookings={bookings} />}

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">All Bookings List</TabsTrigger>
            <TabsTrigger value="agenda">Room Agenda View</TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: LIST VIEW */}
        <TabsContent value="list">
          <Card className="shadow-md">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-primary" />
                  Booking Log
                </CardTitle>
                <CardDescription>
                  Master record of all system reservations.
                </CardDescription>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user or room..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-10 text-center animate-pulse">
                  Loading...
                </div>
              ) : (
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
                      {filteredBookings.map((b) => {
                        const isPast = new Date(b.end_time) < new Date();
                        return (
                          <TableRow key={b.id} className="hover:bg-muted/10">
                            <TableCell className="font-medium">
                              {b.profiles?.email}
                            </TableCell>
                            <TableCell>
                              {b.spaces?.name} <br />
                              <span className="text-xs text-muted-foreground">
                                {b.spaces?.type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {format(new Date(b.start_time), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {format(new Date(b.start_time), "HH:mm")} -{" "}
                              {format(new Date(b.end_time), "HH:mm")}
                            </TableCell>
                            <TableCell>
                              {isPast ? (
                                <Badge variant="outline">Completed</Badge>
                              ) : (
                                <Badge className="bg-green-600">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={deletingId === b.id}
                                  >
                                    {deletingId === b.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Booking?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(b.id)}
                                      className="bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ROOM AGENDA VIEW (Requirement 5.4.3.d) */}
        <TabsContent value="agenda">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => {
              const isOccupied = isRoomOccupiedNow(space.id);

              // Filter bookings for this room specifically
              const roomBookings = bookings
                .filter((b) => b.spaces?.name === space.name)
                .filter((b) => new Date(b.end_time) > new Date()) // Only future/current
                .sort(
                  (a, b) =>
                    new Date(a.start_time).getTime() -
                    new Date(b.start_time).getTime()
                )
                .slice(0, 5); // Show next 5 only

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
                        <CardTitle className="text-lg">{space.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {space.floors?.name || "Unknown Floor"}
                        </CardDescription>
                      </div>
                      {isOccupied ? (
                        <Badge variant="destructive" className="animate-pulse">
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
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
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
                              className="flex justify-between items-center text-sm bg-white dark:bg-slate-950 p-2 rounded shadow-sm border"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">
                                  {format(new Date(rb.start_time), "MMM d")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(rb.start_time), "HH:mm")} -{" "}
                                  {format(new Date(rb.end_time), "HH:mm")}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-medium block truncate max-w-[80px]">
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
  );
};

export default AdminBookings;
