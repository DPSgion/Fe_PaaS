import { useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { Button } from '../../../components/ui/Button';
import { type CreateUserPayload } from '../api/adminApi';

interface AddUserModalProps {
  currentUserRole: string;
  onClose: () => void;
  onSave: (payload: CreateUserPayload) => Promise<void>;
}

export const AddUserModal = ({ currentUserRole, onClose, onSave }: AddUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'DEVELOPER',
    avatarUrl: '' 
  });
  
  // State chuyên biệt để quản lý File upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; username?: string; general?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Hàm bắt sự kiện khi người dùng chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Tạo một URL tạm thời trên RAM trình duyệt để hiện ảnh Preview
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hàm xóa file đã chọn
  const handleRemoveFile = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); 
    
    try {
      let finalAvatarUrl = formData.avatarUrl;

      // Nếu có chọn file, phải up lên Cloud trước
      if (avatarFile) {
        console.log("Đang upload ảnh lên Cloud...", avatarFile.name);
        
        // TODO: Viết hàm gọi API upload lên S3 hoặc Cloudinary ở đây
        // const uploadResponse = await cloudApi.uploadImage(avatarFile);
        // finalAvatarUrl = uploadResponse.url;
        
        // Tạm thời dùng chính cái link Preview để API Java không bị lỗi lúc test
        finalAvatarUrl = previewUrl || ''; 
      }

      // Đẩy dữ liệu cuối cùng lên Cha để gọi Spring Boot
      await onSave({ ...formData, avatarUrl: finalAvatarUrl });
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Lỗi hệ thống không xác định.';
      const lowerMsg = errorMsg.toLowerCase();
      
      if (lowerMsg.includes('email')) {
        setErrors({ email: errorMsg });
      } else if (lowerMsg.includes('username')) {
        setErrors({ username: errorMsg });
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
          </div>
          
          <div className="p-6 space-y-4">
            {errors.general && (
              <div className="px-4 py-3 mb-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg">
                {errors.general}
              </div>
            )}

            {/* KHU VỰC UPLOAD AVATAR */}
            <div className="flex items-start gap-4">
              <label className="w-24 text-sm font-medium text-gray-700 mt-2">Avatar:</label>
              <div className="flex-1 flex items-center gap-4">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm" />
                    <button 
                      type="button" 
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <label 
                    title="Tính năng đang được phát triển"
                    className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 transition-colors cursor-not-allowed text-gray-300 opacity-60"
                  >
                    <FiUploadCloud size={20} />
                    <input type="file" accept="image/*" disabled className="hidden" />
                  </label>
                )}
                <div className="text-xs text-gray-400 opacity-70">
                  <p>Hỗ trợ định dạng: JPG, PNG, GIF.</p>
                  <p>Kích thước tối đa: 2MB. <span className="text-orange-500 font-semibold">(Chưa phát triển)</span></p>
                </div>
              </div>
            </div>

            {/* CÁC TRƯỜNG THÔNG TIN KHÁC */}
            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Username:</label>
                <input 
                  type="text" name="username" value={formData.username} onChange={handleInputChange} required 
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none transition-colors ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} 
                />
              </div>
              {errors.username && <p className="text-xs text-red-600 mt-1 ml-28 font-medium">{errors.username}</p>}
            </div>
            
            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Email:</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange} required 
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none transition-colors ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`} 
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1 ml-28 font-medium">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Full name:</label>
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Password:</label>
                <input 
                  type="text" name="password" value={formData.password} onChange={handleInputChange} required placeholder="Nhập hoặc tạo tự động..." 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                />
                <button 
                  type="button" onClick={handleGeneratePassword}
                  className="text-xs text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg border border-indigo-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Auto Generate
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="w-24 text-sm font-medium text-gray-700">Role:</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="DEVELOPER">Developer</option>
                {currentUserRole === 'SYSTEM_ADMIN' && <option value="ADMIN">Admin</option>}
              </select>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save and Mail'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};