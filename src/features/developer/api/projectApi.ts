import axios from '../../../lib/axios';

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
    // Các trường dưới đây Backend chưa có, tạm thời để optional
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

    // Gọi endpoint thực tế của Spring Boot
    importProject: async (payload: { projectName: string; repoFullName: string; branch: string }) => {
        const response = await axios.post('/projects/import', payload);
        return response.data; // Trả về entity Project từ Backend
    },

    getEnvs: async (projectId: string | number): Promise<EnvVarResponse[]> => {
        const response = await axios.get(`/projects/${projectId}/envs`);
        return response.data;
    },

    getMyProjects: async (): Promise<ProjectListResponse[]> => {
        const response = await axios.get('/projects');
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

    // API Mock cho Lịch sử Deploy (Chờ Backend làm xong API thật thì đổi đường dẫn)
    getDeployHistories: async (projectId: string | number) => {
        // Tạm thời mock data để giao diện lên hình
        return [
            { id: 1, commitSha: 'a1b2c3d4', message: 'feat: update payment gateway', status: 'Success', buildTime: '2m 15s', time: '12/05/2026 14:30' },
            { id: 2, commitSha: 'f9e8d7c6', message: 'fix: resolve memory leak issue', status: 'Failed', buildTime: '1m 50s', time: '11/05/2026 09:15' }
        ];
    }
};