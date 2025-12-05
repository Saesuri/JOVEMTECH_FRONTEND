// client/src/types/apiTypes.ts

// --- Coordinate Types ---
export interface RectCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonCoordinates {
  points: number[]; // [x1, y1, x2, y2, x3, y3...]
}

// --- Domain Models ---
export interface Floor {
  id: string;
  name: string;
  width: number;
  height: number;
  created_at: string;
}

export interface CreateFloorDTO {
  name: string;
  width: number;
  height: number;
}

// A Room in the UI can be one of two shapes
// We use a "Discriminated Union" (the 'type' field tells TS which one it is)
export type RoomShape =
  | {
      id: string;
      name: string;
      shapeType: "rect";
      data: RectCoordinates;
    }
  | {
      id: string;
      name: string;
      shapeType: "polygon";
      data: PolygonCoordinates;
    };

// --- DTOs (Data Transfer Objects) for API ---
export interface Space {
  id: string;
  floor_id: string;
  name: string;
  type: string;
  capacity: number;
  coordinates: RectCoordinates | PolygonCoordinates | unknown;
  created_at: string;
}

export interface CreateSpaceDTO {
  floor_id: string;
  name: string;
  type: string;
  capacity: number;
  coordinates: RectCoordinates | PolygonCoordinates;
}

// Add these to your existing types
export interface Booking {
  id: string;
  space_id: string;
  user_id: string;
  start_time: string; // ISO String
  end_time: string; // ISO String
}

export interface CreateBookingDTO {
  space_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
}
