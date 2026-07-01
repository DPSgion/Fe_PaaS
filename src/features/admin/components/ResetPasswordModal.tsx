import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { type AdminUser } from '../api/adminApi';

interface ResetPasswordModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (userId: number, newPassword: string) => Promise<void>;
}

export const ResetPasswordModal = ({ user, onClose, onConfirm }: ResetPasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirm(user.id, password);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-teal-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
            <p className="text-xs text-gray-500 mt-1">
              Set a new password for user: <strong className="text-gray-800">{user.username}</strong>
            </p>
          </div>
          
          <div className="p-6">
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg mb-4">
              <p className="text-xs text-teal-800 font-medium">
                Lưu ý: Hành động này sẽ thay đổi mật khẩu của người dùng ngay lập tức. Hãy đảm bảo bạn đã lưu lại mật khẩu mới để gửi cho họ.
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập hoặc tạo tự động..."
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
              <button 
                type="button"
                onClick={handleGeneratePassword}
                className="text-xs text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg border border-teal-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Auto Generate
              </button>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !password.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};