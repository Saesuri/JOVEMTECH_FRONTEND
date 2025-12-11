import axios, { type AxiosResponse } from "axios";
import type {
  Floor,
  CreateFloorDTO,
  Space,
  SpaceWithFloor,
  CreateSpaceDTO,
  Booking,
  CreateBookingDTO,
  BookingWithSpace,
  BookingAdminResponse,
  RoomType,
  UserProfile,
  AuditLog,
  SystemSettings,
} from "../types/apiTypes";

// --- AXIOS INSTANCE ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// --- SERVICES ---

export const floorService = {
  getAll: async (): Promise<Floor[]> => {
    const response: AxiosResponse<Floor[]> = await api.get("/floors");
    return response.data;
  },
  create: async (floorData: CreateFloorDTO): Promise<Floor> => {
    const response: AxiosResponse<Floor> = await api.post("/floors", floorData);
    return response.data;
  },
  update: async (id: string, name: string): Promise<Floor> => {
    const response = await api.put(`/floors/${id}`, { name });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/floors/${id}`);
  },
  getStats: async (
    id: string
  ): Promise<{ spaceCount: number; bookingCount: number }> => {
    const response = await api.get(`/floors/${id}/stats`);
    return response.data;
  },
};

export const spaceService = {
  create: async (spaceData: CreateSpaceDTO): Promise<Space> => {
    const response: AxiosResponse<Space> = await api.post("/spaces", spaceData);
    return response.data;
  },
  getAll: async (floorId: string): Promise<Space[]> => {
    const response: AxiosResponse<Space[]> = await api.get(
      `/spaces?floor_id=${floorId}`
    );
    return response.data;
  },
  getAllGlobal: async (): Promise<SpaceWithFloor[]> => {
    const response = await api.get("/admin/spaces");
    return response.data;
  },
  update: async (id: string, data: Partial<Space>): Promise<Space> => {
    const response = await api.put(`/spaces/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/spaces/${id}`);
  },
};

export const bookingService = {
  create: async (bookingData: CreateBookingDTO): Promise<Booking> => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },
  getOccupied: async (start: string, end: string): Promise<string[]> => {
    const response = await api.get(
      `/bookings/occupied?start_time=${start}&end_time=${end}`
    );
    return response.data;
  },
  getByUser: async (userId: string): Promise<BookingWithSpace[]> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },
  cancel: async (bookingId: string, adminId?: string): Promise<void> => {
    const url = adminId
      ? `/bookings/${bookingId}?admin_id=${adminId}`
      : `/bookings/${bookingId}`;
    await api.delete(url);
  },
  getAllAdmin: async (): Promise<BookingAdminResponse[]> => {
    const response = await api.get("/admin/bookings");
    return response.data;
  },
  getBySpace: async (spaceId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings?space_id=${spaceId}`);
    return response.data;
  },
};

export const configService = {
  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await api.get("/config/room-types");
    return response.data;
  },
  createRoomType: async (data: {
    value: string;
    label: string;
  }): Promise<RoomType> => {
    const response = await api.post("/config/room-types", data);
    return response.data;
  },
  deleteRoomType: async (id: string): Promise<void> => {
    await api.delete(`/config/room-types/${id}`);
  },
  getUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get("/config/users");
    return response.data;
  },
  updateUserRole: async (id: string, role: string) => {
    await api.put(`/config/users/${id}/role`, { role });
  },
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await api.get("/config/system");
    return response.data;
  },
  updateSetting: async (key: string, value: string) => {
    await api.put("/config/system", { key, value });
  },
  toggleRoomStatus: async (id: string, is_active: boolean) => {
    await api.put(`/config/spaces/${id}/status`, { is_active });
  },
};

export const loggingService = {
  getLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get("/admin/logs");
    return response.data;
  },
};

export const userService = {
  getProfile: async (id: string): Promise<UserProfile> => {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  },
  updateProfile: async (
    id: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const response = await api.put(`/profiles/${id}`, data);
    return response.data;
  },
};

export default api;
