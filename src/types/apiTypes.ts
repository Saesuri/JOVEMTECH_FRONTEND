// client/src/types/apiTypes.ts

// --- GEOMETRY ---
export interface RectCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonCoordinates {
  points: number[];
}

export type RoomShape =
  | {
      id: string;
      name: string;
      description?: string;
      is_active?: boolean;
      capacity?: number;
      type?: string;
      shapeType: "rect";
      amenities?: string[];
      data: RectCoordinates;
    }
  | {
      id: string;
      name: string;
      description?: string;
      is_active?: boolean;
      capacity?: number;
      type?: string;
      shapeType: "polygon";
      amenities?: string[];
      data: PolygonCoordinates;
    };

// --- DATABASE ENTITIES ---

export interface Floor {
  id: string;
  name: string;
  width: number;
  height: number;
  created_at: string;
}

export interface Space {
  id: string;
  floor_id: string;
  name: string;
  description?: string;
  type: string;
  capacity: number;
  coordinates: RectCoordinates | PolygonCoordinates | unknown;
  amenities?: string[];
  is_active?: boolean;
  created_at: string;
}

// Joined Space (includes floor name)
export interface SpaceWithFloor extends Space {
  floors: { name: string };
}

export interface RoomType {
  id: string;
  value: string;
  label: string;
}

export interface Booking {
  id: string;
  space_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
}

// Booking with joined Space details (for User Dashboard)
export interface BookingWithSpace extends Booking {
  spaces: {
    name: string;
    type: string;
  };
}

// Booking with joined Profile & Space (for Admin Dashboard)
export interface BookingAdminResponse {
  id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  spaces: { name: string; type: string };
  profiles: { email: string };
}

export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  full_name?: string;
  phone?: string;
  department?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
  profiles: { email: string };
}

export interface SystemSettings {
  business_start: string;
  business_end: string;
}

// --- DTOs (Data Transfer Objects for creating/updating) ---

export interface CreateFloorDTO {
  name: string;
  width: number;
  height: number;
}

export interface CreateSpaceDTO {
  id?: string;
  floor_id: string;
  name: string;
  description?: string;
  type: string;
  capacity: number;
  amenities?: string[];
  coordinates: RectCoordinates | PolygonCoordinates;
}

export interface CreateBookingDTO {
  space_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
}
