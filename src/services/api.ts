import axios, { type AxiosResponse } from 'axios';
import type { 
  Floor, 
  CreateFloorDTO, 
  Space, 
  CreateSpaceDTO, 
  Booking, 
  CreateBookingDTO 
} from '../types/apiTypes';

// Define a type for the joined Admin Data
export interface BookingAdminResponse {
  id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  spaces: { name: string; type: string };
  profiles: { email: string };
}

export interface SpaceWithFloor extends Space {
  floors: { name: string };
}

export interface BookingWithSpace extends Booking {
  spaces: {
    name: string;
    type: string;
  };
}

// Environment variables or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const floorService = {
  getAll: async (): Promise<Floor[]> => {
    const response: AxiosResponse<Floor[]> = await api.get('/floors');
    return response.data;
  },
  create: async (floorData: CreateFloorDTO): Promise<Floor> => {
    const response: AxiosResponse<Floor> = await api.post('/floors', floorData);
    return response.data;
  },
  update: async (id: string, name: string): Promise<Floor> => {
    const response = await api.put(`/floors/${id}`, { name });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/floors/${id}`);
  },
    getStats: async (id: string): Promise<{ spaceCount: number, bookingCount: number }> => {
    const response = await api.get(`/floors/${id}/stats`);
    return response.data;
  },
};

export const spaceService = {
  create: async (spaceData: CreateSpaceDTO): Promise<Space> => {
    const response: AxiosResponse<Space> = await api.post('/spaces', spaceData);
    return response.data;
  },
  getAll: async (floorId: string): Promise<Space[]> => {
    const response: AxiosResponse<Space[]> = await api.get(`/spaces?floor_id=${floorId}`);
    return response.data;
  },
  update: async (id: string, data: Partial<Space>): Promise<Space> => {
    const response = await api.put(`/spaces/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/spaces/${id}`);
  },
    getAllGlobal: async (): Promise<SpaceWithFloor[]> => {
    const response = await api.get('/admin/spaces');
    return response.data;
  }
};

export const bookingService = {
  create: async (bookingData: CreateBookingDTO): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getOccupied: async (start: string, end: string): Promise<string[]> => {
    const response = await api.get(`/bookings/occupied?start_time=${start}&end_time=${end}`);
    return response.data;
  },
  getByUser: async (userId: string): Promise<BookingWithSpace[]> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },
  cancel: async (bookingId: string): Promise<void> => {
    await api.delete(`/bookings/${bookingId}`);
  },
  // --- ADDED THIS FUNCTION ---
  getAllAdmin: async (): Promise<BookingAdminResponse[]> => {
    const response = await api.get('/admin/bookings');
    return response.data;
  }
};

export default api;