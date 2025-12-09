import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { type RoomShape } from "../../types/apiTypes";
import { bookingService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toLocalISOString } from "../../utils/dateUtils";

// SHADCN IMPORTS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
}) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const { user } = useAuth();

  // If the dialog closes via clicking outside or ESC, we trigger onClose
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleBook = async () => {
    if (!user) {
      toast.error("You must be logged in to book.");
      return;
    }

    if (!date || !startTime || !endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    const startIso = toLocalISOString(date, startTime);
    const endIso = toLocalISOString(date, endTime);

    const promise = bookingService.create({
      space_id: room!.id,
      user_id: user.id,
      start_time: startIso,
      end_time: endIso,
    });

    toast.promise(promise, {
      loading: "Checking availability...",
      success: () => {
        setTimeout(() => onClose(), 500);
        return "Booking Confirmed! ✅";
      },
      error: (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          return "Conflict: Time slot already booked ❌";
        }
        return "Failed to book ❌";
      },
    });
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
          <DialogDescription>
            Confirm the date and time for your reservation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Start
            </Label>
            <Input
              id="start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              End
            </Label>
            <Input
              id="end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleBook}>Confirm Booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
