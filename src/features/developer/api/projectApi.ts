import axios from '../../../lib/axios';

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface DeploymentHistoryResponse {
    id: number;
    startTime: string;
    buildDuration: string;
    status: string;
    commitSha: string;
    commitMessage: string;
}

export interface ResourceChartData {
    time: string;
    cpu: number;
    ram: number;
}

export interface ProjectMetricsResponse {
    containerId: string | null;
    imageSize: number | null;
    domain: string | null;
}

export interface ProjectUpdateRequest {
    projectName: string;
    branch: string;
    targetPort: number;
    rootDirectory: string | null;
}

// Map chính xác theo GithubRepoResponse của Backend
export interface GithubRepo {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    private: boolean;
    default_branch: string;
}

// Map chính xác theo GithubBranchResponse của Backend
export interface GithubBranch {
    name: string;
}

export interface EnvVarRequest {
    keyName: string;
    value: string;
    isSecret: boolean;
}

export interface EnvVarResponse {
    id: number;
    keyName: string;
    value: string;
    isSecret: boolean;
}

export interface ProjectListResponse {
    id: number;
    projectName: string;
    domain: string | null;
    branch: string;
    status: 'BUILDING' | 'RUNNING' | 'STOPPED' | 'CRASHED';
    createdAt: string;
}

export interface ProjectDetailResponse {
    id: number;
    projectName: string;
    domain: string | null;
    branch: string;
    status: 'BUILDING' | 'RUNNING' | 'STOPPED' | 'CRASHED';
    createdAt: string;
    
    // THÊM 3 TRƯỜNG MỚI TỪ BACKEND
    targetPort: number;
    rootDirectory: string | null;
    githubUrl: string;

    containerId?: string;
    cpuUsage?: string;
    ramUsage?: string;
}

export const projectApi = {
    // Gọi endpoint /github/repos lấy danh sách
    getMyRepositories: async (): Promise<GithubRepo[]> => {
        const response = await axios.get('/github/repos');
        return response.data;
    },

    // Gọi endpoint /github/repos/{owner}/{repo}/branches
    getRepoBranches: async (owner: string, repo: string): Promise<GithubBranch[]> => {
        const response = await axios.get(`/github/repos/${owner}/${repo}/branches`);
        return response.data;
    },

    importProject: async (payload: { projectName: string; repoFullName: string; branch: string; targetPort: number; rootDirectory: string | null }) => {
        const response = await axios.post('/projects/import', payload);
        return response.data;
    },

    updateProjectSettings: async (projectId: string | number, payload: ProjectUpdateRequest): Promise<string> => {
        const response = await axios.put(`/projects/${projectId}/settings`, payload);
        return response.data;
    },

    getEnvs: async (projectId: string | number): Promise<EnvVarResponse[]> => {
        const response = await axios.get(`/projects/${projectId}/envs`);
        return response.data;
    },

    getMyProjects: async (projectName?: string, status?: string): Promise<ProjectListResponse[]> => {
        const params: Record<string, any> = {};
        
        if (projectName && projectName.trim() !== '') {
            params.projectName = projectName.trim();
        }
        if (status && status !== 'ALL') {
            params.status = status;
        }

        const response = await axios.get('/projects', { params });
        return response.data;
    },

    addEnvVar: async (projectId: string | number, payload: EnvVarRequest): Promise<void> => {
        await axios.post(`/projects/${projectId}/envs`, payload);
    },

    updateEnvVar: async (projectId: string | number, envId: number, payload: EnvVarRequest): Promise<void> => {
        await axios.put(`/projects/${projectId}/envs/${envId}`, payload);
    },

    deleteEnvVar: async (projectId: string | number, envId: number): Promise<void> => {
        await axios.delete(`/projects/${projectId}/envs/${envId}`);
    },

    // API Lấy chi tiết 1 dự án
    getProjectDetail: async (projectId: string | number): Promise<ProjectDetailResponse> => {
        const response = await axios.get(`/projects/${projectId}`);
        return response.data;
    },

    triggerDeploy: async (projectId: string | number): Promise<string> => {
        // Deploy/Build có thể kéo dài, nới lỏng cho phép đợi tối đa 2 phút (120000ms)
        const response = await axios.post(`/deployments/${projectId}/deploy`, null, { timeout: 120000 });
        return response.data; 
    },

    restartProject: async (projectId: string | number): Promise<string> => {
        // Restart cần thời gian stop rồi start lại, cho phép đợi 60 giây
        const response = await axios.post(`/deployments/${projectId}/restart`, null, { timeout: 60000 });
        return response.data;
    },

    // API Dừng dự án
    stopProject: async (projectId: string | number): Promise<string> => {
        const response = await axios.post(`/deployments/${projectId}/stop`, null, { timeout: 60000 });
        return response.data;
    },

    // API Khởi động dự án
    startProject: async (projectId: string | number): Promise<string> => {
        const response = await axios.post(`/deployments/${projectId}/start`, null, { timeout: 60000 });
        return response.data;
    },

    // API Lấy thông số giám sát dự án
    getProjectMetrics: async (projectId: string | number): Promise<ProjectMetricsResponse> => {
        const response = await axios.get(`/monitoring/projects/${projectId}/metrics`);
        return response.data;
    },

    // API Lấy dữ liệu biểu đồ tài nguyên
    getResourceChart: async (projectId: string | number): Promise<ResourceChartData[]> => {
        const response = await axios.get(`/monitoring/projects/${projectId}/metrics/chart`);
        return response.data;
    },

    // API lấy file log tĩnh sau khi đã build xong
    getStaticDeployLog: async (deploymentId: number): Promise<string> => {
        const response = await axios.get(`/deployments/${deploymentId}/logs`);
        return response.data;
    },

    // API Lấy lịch sử Deploy
    getDeployHistories: async (projectId: string | number, page: number = 0, size: number = 20): Promise<PageResponse<DeploymentHistoryResponse>> => {
        const response = await axios.get(`/deployments/project/${projectId}/histories?page=${page}&size=${size}`);
        return response.data;
    },

    // API Yêu cầu xóa dự án (Gửi OTP)
    requestDeleteProject: async (projectId: string | number): Promise<string> => {
        const response = await axios.post(`/projects/${projectId}/delete/request`);
        return response.data;
    },

    // API Xác nhận xóa dự án bằng OTP
    confirmDeleteProject: async (projectId: string | number, otpCode: string): Promise<string> => {
        // Lưu ý: Request DELETE trong Axios muốn gửi body thì phải bọc trong config { data: ... }
        const response = await axios.delete(`/projects/${projectId}/delete/confirm`, { 
            data: { otpCode } 
        });
        return response.data;
    }
};