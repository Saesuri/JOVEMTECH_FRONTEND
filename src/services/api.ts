// client/src/services/api.ts
import axios, { type AxiosResponse } from "axios";
import type {
  Floor,
  CreateFloorDTO,
  Space,
  CreateSpaceDTO,
  Booking,
  CreateBookingDTO,
} from "../types/apiTypes";

// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 5000,
});

export interface BookingWithSpace extends Booking {
  spaces: {
    name: string;
    type: string;
  };
}

export const floorService = {
  // Returns an array of Floors
  getAll: async (): Promise<Floor[]> => {
    const response: AxiosResponse<Floor[]> = await api.get("/floors");
    return response.data;
  },

  // Returns the single created Floor
  create: async (floorData: CreateFloorDTO): Promise<Floor> => {
    const response: AxiosResponse<Floor> = await api.post("/floors", floorData);
    return response.data;
  },
};

export const spaceService = {
  create: async (spaceData: CreateSpaceDTO): Promise<Space> => {
    const response: AxiosResponse<Space> = await api.post("/spaces", spaceData);
    return response.data;
  },

  // NEW: Fetch spaces by floor
  getAll: async (floorId: string): Promise<Space[]> => {
    const response: AxiosResponse<Space[]> = await api.get(
      `/spaces?floor_id=${floorId}`
    );
    return response.data;
  },
  // 3. Update (THIS WAS MISSING)
  update: async (id: string, data: Partial<Space>): Promise<Space> => {
    const response = await api.put(`/spaces/${id}`, data);
    return response.data;
  },
};

export const bookingService = {
  create: async (bookingData: CreateBookingDTO): Promise<Booking> => {
    // Axios throws an error if status is 400/409/500, so we can catch it in UI
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },
  getBySpace: async (spaceId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings?space_id=${spaceId}`);
    return response.data;
  },
  // NEW: Get list of occupied space IDs
  getOccupied: async (start: string, end: string): Promise<string[]> => {
    const response = await api.get(
      `/bookings/occupied?start_time=${start}&end_time=${end}`
    );
    return response.data;
  },
  // NEW: Get my bookings
  getByUser: async (userId: string): Promise<BookingWithSpace[]> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },

  // NEW: Cancel booking
  cancel: async (bookingId: string): Promise<void> => {
    await api.delete(`/bookings/${bookingId}`);
  },
};

export default api;
