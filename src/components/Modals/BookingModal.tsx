import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { type RoomShape } from "../../types/apiTypes";
import { bookingService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toLocalISOString } from "../../utils/dateUtils";
import { getRoomTypeKey, getAmenityById } from "../../utils/roomUtils";

// SHADCN IMPORTS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, DoorOpen, Info, Armchair } from "lucide-react";

interface BookingModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
  prefilledDate?: string;
  prefilledStartTime?: string;
  prefilledEndTime?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  room,
  isOpen,
  onClose,
  prefilledDate = "",
  prefilledStartTime = "09:00",
  prefilledEndTime = "10:00",
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState(prefilledDate || "");
  const [startTime, setStartTime] = useState(prefilledStartTime);
  const [endTime, setEndTime] = useState(prefilledEndTime);

  const { user } = useAuth();

  // If the dialog closes via clicking outside or ESC, we trigger onClose
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleBook = async () => {
    if (!user) {
      toast.error(t("bookingModal.messages.loginRequired"));
      return;
    }

    if (!date || !startTime || !endTime) {
      toast.error(t("bookingModal.messages.fillAllFields"));
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
      loading: t("bookingModal.messages.checking"),
      success: () => {
        setTimeout(() => onClose(), 500);
        return t("bookingModal.messages.confirmed");
      },
      error: (err) => {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          return t("bookingModal.messages.conflict");
        }
        return t("bookingModal.messages.failed");
      },
    });
  };

  if (!room) return null;

  const roomType = room.type ? t(getRoomTypeKey(room.type)) : "";
  const roomAmenities = room.amenities || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-primary" />
            {t("bookingModal.title", { name: room.name })}
          </DialogTitle>
          <DialogDescription>{t("bookingModal.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Form - Horizontal Layout */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              {t("bookingModal.scheduleTitle")}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-xs">
                  {t("booking.date")}
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start" className="text-xs">
                  {t("booking.startTime")}
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end" className="text-xs">
                  {t("booking.endTime")}
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Room Details - Compact */}
          <div className="bg-muted/30 rounded-lg p-3 border space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t("bookingModal.roomDetails")}
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {room.capacity || 0} {t("bookingModal.people")}
                  </span>
                </div>
                {roomType && <Badge variant="secondary">{roomType}</Badge>}
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <p className="text-sm text-muted-foreground">
                {room.description}
              </p>
            )}

            {/* Amenities - Inline */}
            {roomAmenities.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Armchair className="h-4 w-4 text-muted-foreground" />
                {roomAmenities.map((amenityId) => {
                  const amenity = getAmenityById(amenityId);
                  if (!amenity) return null;
                  const Icon = amenity.icon;
                  return (
                    <Badge
                      key={amenityId}
                      variant="outline"
                      className="gap-1 py-0.5 text-xs"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {t(amenity.labelKey)}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-1" />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleBook}>{t("bookingModal.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
