import {
  Wifi,
  Tv,
  Projector,
  Mic,
  Video,
  Wind,
  PenTool,
  type LucideIcon,
} from "lucide-react";

// Room type mapping
export const ROOM_TYPES: Record<string, string> = {
  meeting_room: "roomEdit.types.meetingRoom",
  lab: "roomEdit.types.lab",
  auditorium: "roomEdit.types.auditorium",
  office: "roomEdit.types.office",
};

// Amenity definitions with translation keys and icons
export interface AmenityDef {
  id: string;
  labelKey: string;
  icon: LucideIcon | null;
}

export const AMENITY_OPTIONS: AmenityDef[] = [
  { id: "wifi", labelKey: "roomEdit.amenities.wifi", icon: Wifi },
  { id: "tv", labelKey: "roomEdit.amenities.tv", icon: Tv },
  {
    id: "projector",
    labelKey: "roomEdit.amenities.projector",
    icon: Projector,
  },
  {
    id: "whiteboard",
    labelKey: "roomEdit.amenities.whiteboard",
    icon: PenTool,
  },
  { id: "video_conf", labelKey: "roomEdit.amenities.videoConf", icon: Video },
  { id: "ac", labelKey: "roomEdit.amenities.ac", icon: Wind },
  { id: "mic", labelKey: "roomEdit.amenities.mic", icon: Mic },
];

// Helper to get amenity definition by id
export const getAmenityById = (id: string): AmenityDef | undefined => {
  return AMENITY_OPTIONS.find((a) => a.id === id);
};

// Get room type translation key
export const getRoomTypeKey = (type: string): string => {
  return ROOM_TYPES[type] || type;
};
