import axios from '../../../lib/axios';

export interface NotificationResponse {
  id: number;
  projectId?: number;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  content: NotificationResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const notificationApi = {
  getHistory: async (page: number = 0, size: number = 10): Promise<PaginatedNotifications> => {
    const response = await axios.get('/notifications', { params: { page, size } });
    return response.data;
  },
};