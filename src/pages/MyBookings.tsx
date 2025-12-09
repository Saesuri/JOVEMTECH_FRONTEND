import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/api";
import type { BookingWithSpace } from "../types/apiTypes"; // <--- FIXED IMPORT
import { toast } from "sonner";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
} from "../utils/calendarLinks";
import { formatDate, formatTimeRange } from "../utils/formatters";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarX,
  Clock,
  MapPin,
  Trash2,
  CalendarPlus,
  ExternalLink,
} from "lucide-react";

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
    setDeletingId(id);
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

  const handleAddToCalendar = (
    type: "google" | "outlook" | "office",
    booking: BookingWithSpace
  ) => {
    const event = {
      title: `Booking: ${booking.spaces?.name}`,
      start: booking.start_time,
      end: booking.end_time,
      location: `CajuHub - ${booking.spaces?.name}`,
      description: `Room Type: ${booking.spaces?.type}`,
    };

    let url = "";
    if (type === "google") url = generateGoogleCalendarUrl(event);
    if (type === "outlook") url = generateOutlookUrl(event, "live");
    if (type === "office") url = generateOutlookUrl(event, "office");

    window.open(url, "_blank");
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
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Booking History
          </CardTitle>
          <CardDescription>
            View and manage your upcoming and past reservations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <CalendarX className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No bookings found
              </h3>
              <p>You haven't made any reservations yet.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
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
                        className={
                          isPast
                            ? "opacity-60 bg-muted/30"
                            : "hover:bg-muted/10"
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md text-blue-600 dark:text-blue-400">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {booking.spaces?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {booking.spaces?.type?.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(booking.start_time)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatTimeRange(
                            booking.start_time,
                            booking.end_time
                          )}
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
                            <Badge className="bg-green-600 hover:bg-green-700 border-transparent text-white shadow hover:shadow-md transition-all">
                              Upcoming
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isPast && (
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <CalendarPlus className="h-4 w-4" />
                                    Add to Calendar
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAddToCalendar("google", booking)
                                    }
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                    Google Calendar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAddToCalendar("outlook", booking)
                                    }
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                    Outlook.com
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleAddToCalendar("office", booking)
                                    }
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                    Office 365
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    disabled={deletingId === booking.id}
                                  >
                                    {deletingId === booking.id ? (
                                      "..."
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-600">
                                      Cancel Booking?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will release the room{" "}
                                      <strong>{booking.spaces?.name}</strong>{" "}
                                      immediately.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Keep Booking
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                      onClick={() => handleCancel(booking.id)}
                                    >
                                      Yes, Cancel it
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
