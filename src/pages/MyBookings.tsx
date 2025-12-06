import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService, type BookingWithSpace } from "../services/api";
import { toast } from "sonner";
import { format } from "date-fns"; // Standard JS Date formatting is fine too, but let's stick to native Intl for now to save installing libs

// SHADCN IMPORTS
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CalendarX, Clock, MapPin } from "lucide-react";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        const data = await bookingService.getByUser(user.id);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Could not load your bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancel = async (id: string) => {
    setDeletingId(id); // Show loading state on button
    try {
      await bookingService.cancel(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  // Helper for Date Formatting (e.g., "Mon, Dec 12, 2023")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Helper for Time Formatting (e.g., "14:00 - 15:00")
  const formatTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const timeOpt: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return `${s.toLocaleTimeString([], timeOpt)} - ${e.toLocaleTimeString(
      [],
      timeOpt
    )}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Booking History
          </CardTitle>
          <CardDescription>
            View and manage your upcoming and past reservations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CalendarX className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>You haven't made any bookings yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const isPast = new Date(booking.end_time) < new Date();

                    return (
                      <TableRow
                        key={booking.id}
                        className={isPast ? "opacity-60 bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              {booking.spaces?.name || "Unknown"}
                              <div className="text-xs text-muted-foreground capitalize">
                                {booking.spaces?.type?.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(booking.start_time)}</TableCell>
                        <TableCell>
                          {formatTimeRange(
                            booking.start_time,
                            booking.end_time
                          )}
                        </TableCell>
                        <TableCell>
                          {isPast ? (
                            <Badge variant="secondary">Completed</Badge>
                          ) : (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              Upcoming
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isPast && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === booking.id}
                                >
                                  {deletingId === booking.id ? "..." : "Cancel"}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Booking?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will release the room{" "}
                                    <strong>{booking.spaces?.name}</strong>{" "}
                                    immediately. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Keep Booking
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleCancel(booking.id)}
                                  >
                                    Yes, Cancel it
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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
    </div>
  );
};

export default MyBookings;
