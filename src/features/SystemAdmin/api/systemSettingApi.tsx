import axios from '../../../lib/axios';

export interface SettingResponse {
    settingKey: string;
    settingValue: string;
    dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'CRON';
    description: string;
    updatedAt: string;
}

export const systemSettingApi = {
    getAllSettings: async (): Promise<SettingResponse[]> => {
        const response = await axios.get('/settings');
        return response.data;
    },

    updateSetting: async (key: string, settingValue: string): Promise<string> => {
        const response = await axios.put(`/settings/${key}`, { settingValue });
        return response.data;
    }
};