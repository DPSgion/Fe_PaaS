import axios from '../../../lib/axios';

export interface ResetPasswordPayload {
  password: string;
}

export interface ResetPasswordResponse {
  username: string;
  newPassword: string;
}


export interface CreateUserPayload {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: string;
  avatarUrl?: string;
}

export interface ChangeStatusPayload {
  status: 'ACTIVE' | 'BANNED';
  reason?: string;
}

export interface UpdateRolePayload {
  role: string;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  githubUsername: string | null;
  role: string;
  status: string;
  createdAt: string;

  activeProjectCount: number;
  totalProjectCount: number;
}

export interface PaginatedUsers {
  content: AdminUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const adminApi = {
  getUsers: async (page: number = 0, size: number = 10, search?: string, role?: string): Promise<PaginatedUsers> => {
    const params: Record<string, any> = { page, size };
    
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }
    
    if (role && role !== 'ALL') {
      params.role = role;
    }

    const response = await axios.get('/admin/users', { params });
    return response.data;
  },

  changeRole: async (userId: number, payload: UpdateRolePayload): Promise<AdminUser> => {
    const response = await axios.patch(`/admin/users/${userId}/role`, payload);
    return response.data;
  },

  changeStatus: async (userId: number, payload: ChangeStatusPayload): Promise<AdminUser> => {
    const response = await axios.patch(`/admin/users/${userId}/status`, payload);
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<AdminUser> => {
    const response = await axios.post('/admin/users', payload);
    return response.data;
  },

  resetPassword: async (userId: number, payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await axios.post(`/admin/users/${userId}/reset-password`, payload);
    return response.data;
  }
};