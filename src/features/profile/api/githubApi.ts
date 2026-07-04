import axios from '../../../lib/axios';

export interface GithubIntegrationResult {
  githubUsername: string;
  accessToken: string;
  message: string;
}

export const githubApi = {
  linkAccount: async (code: string): Promise<GithubIntegrationResult> => {
    const response = await axios.get('/github/callback', {
      params: { code }
    });
    return response.data;
  }
};