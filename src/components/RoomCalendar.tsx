import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarPlus,
} from "lucide-react";
import { bookingService } from "../services/api";
import type { RoomShape, Booking } from "../types/apiTypes";

// Constants - could be made configurable later via facility settings
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 22;
const HOURS = Array.from(
  { length: WORK_END_HOUR - WORK_START_HOUR },
  (_, i) => WORK_START_HOUR + i
);

interface RoomCalendarProps {
  room: RoomShape;
  onSlotClick: (date: string, startTime: string, endTime: string) => void;
  onBookRoom: () => void;
}

// Get Monday of the week containing the given date
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
};

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Get day name
const getDayName = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, { weekday: "short" });
};

// Get day number
const getDayNumber = (date: Date): number => {
  return date.getDate();
};

const RoomCalendar: React.FC<RoomCalendarProps> = ({
  room,
  onSlotClick,
  onBookRoom,
}) => {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  // Generate week days (Mon-Sun)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  // Load bookings for the room and week
  React.useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const spaceBookings = await bookingService.getBySpace(room.id);
        // Filter bookings for this week
        const weekBookings = spaceBookings.filter((b) => {
          const bookingDate = new Date(b.start_time);
          return bookingDate >= weekStart && bookingDate < weekEnd;
        });
        setBookings(weekBookings);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [room.id, weekStart]);

  // Check if a slot is booked
  const isSlotBooked = (date: Date, hour: number): Booking | null => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return (
      bookings.find((b) => {
        const bookingStart = new Date(b.start_time);
        const bookingEnd = new Date(b.end_time);
        // Check if slot overlaps with booking
        return slotStart < bookingEnd && slotEnd > bookingStart;
      }) || null
    );
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  // Check if slot is in the past
  const isPast = (date: Date, hour: number): boolean => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < now;
  };

  // Navigate to previous/next week
  const goToPrevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newStart);
  };

  const goToToday = () => {
    setWeekStart(getMonday(new Date()));
  };

  // Handle slot click
  const handleSlotClick = (date: Date, hour: number) => {
    if (isPast(date, hour)) return;
    if (isSlotBooked(date, hour)) return;

    const dateStr = formatDate(date);
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    onSlotClick(dateStr, startTime, endTime);
  };

  const locale = i18n.language === "pt-BR" ? "pt-BR" : "en-US";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{room.name}</h3>
          <Badge variant="secondary">
            {room.capacity} {t("bookingModal.people")}
          </Badge>
          <Button size="sm" onClick={onBookRoom} className="gap-2 ml-2">
            <CalendarPlus className="h-4 w-4" />
            {t("calendar.bookRoom")}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            {t("calendar.today")}
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {weekStart.toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDays[6].toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/50 sticky top-0 z-10">
            <div className="p-2 border-r"></div>
            {weekDays.map((date, i) => (
              <div
                key={i}
                className={`p-2 text-center border-r last:border-r-0 ${
                  isToday(date) ? "bg-primary/10" : ""
                }`}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {getDayName(date, locale)}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday(date) ? "text-primary" : ""
                  }`}
                >
                  {getDayNumber(date)}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              {t("common.loading")}...
            </div>
          ) : (
            HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0"
              >
                <div className="p-2 text-xs text-muted-foreground text-right border-r">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDays.map((date, i) => {
                  const booking = isSlotBooked(date, hour);
                  const past = isPast(date, hour);
                  const booked = !!booking;
                  const clickable = !past && !booked;

                  return (
                    <div
                      key={i}
                      onClick={() => clickable && handleSlotClick(date, hour)}
                      className={`
                        p-1 border-r last:border-r-0 min-h-[40px] transition-colors
                        ${past ? "bg-slate-100 dark:bg-slate-800/50" : ""}
                        ${booked ? "bg-red-100 dark:bg-red-950/30" : ""}
                        ${
                          clickable
                            ? "hover:bg-green-100 dark:hover:bg-green-950/30 cursor-pointer"
                            : ""
                        }
                        ${
                          isToday(date) && !past && !booked
                            ? "bg-primary/5"
                            : ""
                        }
                      `}
                    >
                      {booked && (
                        <div className="text-xs px-1 py-0.5 bg-red-500/20 text-red-700 dark:text-red-400 rounded truncate">
                          {t("calendar.booked")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/30 border"></div>
          <span>{t("calendar.available")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/30 border"></div>
          <span>{t("calendar.booked")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800/50 border"></div>
          <span>{t("calendar.past")}</span>
        </div>
      </div>
    </div>
  );
};

export default RoomCalendar;
