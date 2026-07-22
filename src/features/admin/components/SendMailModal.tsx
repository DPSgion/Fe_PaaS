import { useState } from 'react';
import { FiMail, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import { adminApi, type AdminProjectListResponse } from '../api/projectApi';

interface SendMailModalProps {
    project: AdminProjectListResponse; 
    onClose: () => void;
}

export const SendMailModal = ({ project, onClose }: SendMailModalProps) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    const handleSendMail = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!subject.trim() || !content.trim()) {
            setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
            return;
        }

        setIsSending(true);
        setError('');

        try {
            // SỬA GẮT: Dùng adminApi và project.projectId thay vì project.id
            const message = await adminApi.sendMailToDeveloper(project.projectId, { subject, content });
            window.alert(message || "Đã gửi email thông báo thành công!");
            onClose(); 
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Lỗi hệ thống. Không thể gửi mail lúc này.";
            setError(errMsg);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header Modal */}
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FiMail className="text-indigo-600 text-xl" />
                        <h3 className="text-lg font-bold text-indigo-900">Send Mail to Developer</h3>
                    </div>
                    <button onClick={onClose} className="text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer">
                        <FiX size={20} />
                    </button>
                </div>
                
                {/* Body Modal (Form) */}
                <form onSubmit={handleSendMail}>
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                            Đang soạn thư gửi đến chủ sở hữu của dự án <strong className="text-gray-900">{project.projectName}</strong>.
                        </div>

                        {error && (
                            <div className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Subject</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 text-sm outline-none transition-all"
                                placeholder="[Be-PaaS Admin] Thông báo về dự án..."
                                disabled={isSending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Content</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 text-sm outline-none transition-all resize-none"
                                placeholder="Nhập nội dung thư nhắc nhở/thông báo chi tiết tại đây..."
                                disabled={isSending}
                            />
                        </div>
                    </div>
                    
                    {/* Footer Modal */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={onClose} 
                            disabled={isSending}
                            className="cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            disabled={isSending || !subject.trim() || !content.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold cursor-pointer transition-all flex items-center gap-2"
                        >
                            {isSending ? <FiLoader className="animate-spin" /> : <FiSend />}
                            {isSending ? 'Sending...' : 'Send Mail'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};