import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiLock, FiUnlock, FiLoader } from 'react-icons/fi';
import { projectApi, type EnvVarResponse, type EnvVarRequest } from '../api/projectApi';

interface EnvVariablesTabProps {
    projectId: string | number;
}

export const EnvVariablesTab = ({ projectId }: EnvVariablesTabProps) => {
    const [envVars, setEnvVars] = useState<EnvVarResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Nếu editingId = null -> Mode Thêm mới | Nếu có số -> Mode Cập nhật
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<EnvVarRequest>({
        keyName: '',
        value: '',
        isSecret: false
    });

    const fetchEnvs = async () => {
        try {
            const data = await projectApi.getEnvs(projectId);
            setEnvVars(data);
        } catch (error) {
            console.error("Lỗi tải biến môi trường", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchEnvs();
    }, [projectId]);

    // Mở Modal Thêm mới
    const handleOpenAddModal = () => {
        setEditingId(null);
        setFormData({ keyName: '', value: '', isSecret: false });
        setIsModalOpen(true);
    };

    // Mở Modal Cập nhật
    const handleOpenEditModal = (env: EnvVarResponse) => {
        setEditingId(env.id);
        setFormData({
            keyName: env.keyName,
            // LOGIC SỬA GẮT: Nếu là secret -> Để trống bắt nhập lại. Nếu không -> Bốc value cũ lên.
            value: env.isSecret ? '' : env.value,
            isSecret: env.isSecret
        });
        setIsModalOpen(true);
    };

    // Gửi dữ liệu (Create hoặc Update)
    const handleSubmitModal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.keyName.trim() || !formData.value.trim()) {
            window.alert("Vui lòng điền đầy đủ Key và Value.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // UPDATE
                await projectApi.updateEnvVar(projectId, editingId, formData);
            } else {
                // CREATE
                await projectApi.addEnvVar(projectId, formData);
            }
            // Thành công thì đóng modal và tải lại danh sách
            setIsModalOpen(false);
            fetchEnvs();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi lưu biến môi trường.";
            window.alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xóa biến môi trường ngay lập tức
    const handleDelete = async (envId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa biến môi trường này không? Hành động này có thể làm ứng dụng ngừng hoạt động nếu thiếu biến cấu hình.")) {
            return;
        }
        
        try {
            await projectApi.deleteEnvVar(projectId, envId);
            fetchEnvs(); // Tải lại danh sách sau khi xóa
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi xóa biến môi trường.";
            window.alert(msg);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Đang tải cấu hình...</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header: Dời nút Thêm mới lên đây, bỏ hẳn nút Bulk Save */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Environment Variables</h3>
                    <p className="text-sm text-gray-500">Quản lý cấu hình động cho ứng dụng. Các thay đổi sẽ được áp dụng ở lần deploy tiếp theo.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                    <FiPlus size={18} /> Thêm biến mới
                </button>
            </div>

            {/* Bảng Danh sách Biến (Chỉ hiển thị, không có input) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                
                {/* SỬA GẮT: Thêm sticky, top-0 và z-10 để ghim Header trên cùng */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                    <div className="col-span-4">Key</div>
                    <div className="col-span-5">Value</div>
                    <div className="col-span-1 text-center">Type</div>
                    <div className="col-span-2 text-right pr-4">Actions</div>
                </div>

                {/* SỬA GẮT: Thêm overflow-y-auto để tạo thanh cuộn dọc cho phần nội dung */}
                <div className="divide-y divide-gray-100 overflow-y-auto">
                    {envVars.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Chưa có biến môi trường nào được cấu hình.</div>
                    ) : (
                        envVars.map((env) => (
                            <div key={env.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors">
                                {/* Key */}
                                <div className="col-span-4 font-mono text-sm text-gray-900 font-semibold truncate pr-4">
                                    {env.keyName}
                                </div>

                                {/* Value */}
                                <div className="col-span-5 font-mono text-sm text-gray-600 truncate pr-4">
                                    {env.isSecret ? '••••••••••••••••' : env.value}
                                </div>

                                {/* Indicator (Không phải toggle) */}
                                <div className="col-span-1 flex justify-center">
                                    {env.isSecret ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                            <FiLock size={10} /> Secret
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                            <FiUnlock size={10} /> Plain
                                        </span>
                                    )}
                                </div>

                                {/* Actions (Sửa / Xóa) */}
                                <div className="col-span-2 flex justify-end gap-3 pr-2">
                                    <button
                                        onClick={() => handleOpenEditModal(env)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(env.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                        title="Xóa biến"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODAL THÊM / SỬA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Cập nhật biến cấu hình' : 'Thêm biến môi trường mới'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmitModal} className="p-6 space-y-5">
                            {/* Input Key (1 dòng) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Key Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. DATABASE_URL"
                                    value={formData.keyName}
                                    onChange={(e) => setFormData({ ...formData, keyName: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    required
                                    disabled={!!editingId}
                                    autoFocus={!editingId}
                                />
                            </div>

                            {/* Textarea Value (Nhiều dòng) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center justify-between">
                                    Value 
                                    {editingId && formData.isSecret && <span className="text-xs text-amber-600 font-normal">* Yêu cầu nhập giá trị mới để cập nhật</span>}
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder={editingId && formData.isSecret ? "Nhập mã bí mật mới vào đây..." : "Dán giá trị cấu hình vào đây..."}
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y"
                                    required
                                    autoFocus={!!editingId}
                                ></textarea>
                            </div>

                            {/* Checkbox Secret (Khóa nếu đang Edit) */}
                            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <label className={`relative inline-flex items-center mt-0.5 ${editingId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.isSecret}
                                        disabled={!!editingId}
                                        onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                                    />
                                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Bảo mật giá trị (Secret)</p>
                                    <p className="text-xs text-gray-500 mt-1">Sử dụng cho Token, Password, API Key. Giá trị sẽ được mã hóa và không thể xem lại sau khi lưu.</p>
                                </div>
                            </div>

                            {/* Nút Submit */}
                            <div className="pt-2 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isSubmitting ? <FiLoader className="animate-spin" /> : null}
                                    {editingId ? 'Lưu cập nhật' : 'Tạo biến mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};