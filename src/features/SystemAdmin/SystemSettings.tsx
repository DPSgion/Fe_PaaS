import { useState, useEffect } from 'react';
import { FiSettings, FiSave, FiEdit2, FiX, FiCheckCircle } from 'react-icons/fi';
import { systemSettingApi, type SettingResponse } from './api/systemSettingApi';
import { Button } from '../../components/ui/Button';

export const SystemSettings = () => {
    const [settings, setSettings] = useState<SettingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            const data = await systemSettingApi.getAllSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleEdit = (setting: SettingResponse) => {
        setEditingKey(setting.settingKey);
        setEditValue(setting.settingValue);
    };

    const handleCancel = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const handleSave = async (key: string) => {
        if (!editValue.trim()) return alert("Giá trị không được để trống!");
        setIsSaving(true);
        try {
            await systemSettingApi.updateSetting(key, editValue.trim());
            setEditingKey(null);
            fetchSettings(); // Refresh lại dữ liệu
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi lưu cấu hình!");
        } finally {
            setIsSaving(false);
        }
    };

    const renderInput = (dataType: string) => {
        if (dataType === 'BOOLEAN') {
            return (
                <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="true">True (Bật)</option>
                    <option value="false">False (Tắt)</option>
                </select>
            );
        }
        
        if (dataType === 'NUMBER') {
            return (
                <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            );
        }

        return (
            <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
        );
    };

    if (isLoading) {
        return <div className="p-10 text-center text-gray-500">Đang tải cấu hình hệ thống...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                    <FiSettings size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Cấu hình lõi hệ thống PaaS. Các thay đổi sẽ được nạp trực tiếp vào RAM (Cache).</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-bold w-1/4">Configuration Key</th>
                                <th className="px-6 py-4 font-bold w-1/3">Value</th>
                                <th className="px-6 py-4 font-bold w-1/4">Description</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {settings.map((setting) => (
                                <tr key={setting.settingKey} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-semibold text-gray-900">{setting.settingKey}</div>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                                            {setting.dataType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingKey === setting.settingKey ? (
                                            renderInput(setting.dataType)
                                        ) : (
                                            <span className={`font-mono ${setting.dataType === 'BOOLEAN' ? (setting.settingValue === 'true' ? 'text-green-600 font-bold' : 'text-red-500 font-bold') : 'text-gray-800'}`}>
                                                {setting.settingValue}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 leading-relaxed">
                                        {setting.description}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {editingKey === setting.settingKey ? (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving} className="!px-2 cursor-pointer">
                                                    <FiX size={16} className="text-gray-500" />
                                                </Button>
                                                <Button size="sm" onClick={() => handleSave(setting.settingKey)} disabled={isSaving} className="!px-3 bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white">
                                                    {isSaving ? 'Saving...' : <FiSave size={16} />}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(setting)} className="cursor-pointer">
                                                <FiEdit2 size={14} className="mr-1.5" /> Edit
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};