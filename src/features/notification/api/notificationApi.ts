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
  getHistory: async (
    page: number = 0,
    size: number = 10,
    search?: string,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedNotifications> => {
    const params: Record<string, any> = { page, size };

    if (search && search.trim() !== '') params.search = search.trim();
    if (type && type !== 'ALL') params.type = type;

    // Spring Boot yêu cầu ISO.DATE_TIME (vd: 2026-07-22T00:00:00)
    // Ép từ value của input type="date" (YYYY-MM-DD) sang chuẩn ISO
    if (startDate) params.startDate = `${startDate}T00:00:00`;
    if (endDate) params.endDate = `${endDate}T23:59:59`;

    const response = await axios.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axios.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.patch('/notifications/read-all');
  }
};