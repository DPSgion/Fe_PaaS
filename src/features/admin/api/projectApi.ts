import axios from '../../../lib/axios';

// ============================================================================
// TYPES (ĐỒNG BỘ 100% VỚI SPRING BOOT DTO)
// ============================================================================
export type ProjectStatus = 'RUNNING' | 'STOPPED' | 'CRASHED';

export interface AdminProjectListResponse {
    projectId: number;
    projectName: string;
    ownerUsername: string;
    branch: string;
    subdomain: string;
    status: ProjectStatus;
    cpuUsage: number | null;
    ramUsage: number | null;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// ============================================================================
// API CALLS
// ============================================================================
export const adminApi = {
    getAllProjects: async (
        projectName: string, 
        developer: string, 
        status: string, 
        page: number, 
        size: number
    ): Promise<Page<AdminProjectListResponse>> => {
        
        // Chỉ gửi tham số lên URL nếu nó có giá trị thật
        const params: Record<string, any> = { page, size };
        if (projectName.trim()) params.projectName = projectName;
        if (developer.trim()) params.developer = developer;
        if (status !== 'ALL') params.status = status;

        // Dựa theo Controller @GetMapping("/admin") với class level @RequestMapping("/projects")
        const response = await axios.get('/projects/admin', { params });
        return response.data;
    }
};