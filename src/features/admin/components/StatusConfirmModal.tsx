import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { type AdminUser } from '../api/adminApi';

interface StatusConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: (userId: number, status: 'ACTIVE' | 'BANNED', reason?: string) => Promise<void>;
}

export const StatusConfirmModal = ({ user, onClose, onConfirm }: StatusConfirmModalProps) => {
  const isBanning = user.status === 'ACTIVE'; // Đang Active nghĩa là thao tác chuẩn bị làm là BAN
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newStatus = isBanning ? 'BANNED' : 'ACTIVE';
    // Nếu là Banning thì truyền reason, nếu Unban thì truyền undefined
    await onConfirm(user.id, newStatus, isBanning ? reason : undefined);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-md border overflow-hidden ${isBanning ? 'border-red-200' : 'border-green-200'}`}>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {isBanning ? 'Ban User Account' : 'Unban User Account'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Target user: <strong className="text-gray-800">{user.username}</strong>
          </p>
        </div>
        
        <div className="p-6">
          {isBanning ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for banning <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm quy định hệ thống..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                disabled={isSubmitting}
                required
              />
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn mở khóa tài khoản <strong>{user.username}</strong>? Người dùng này sẽ có thể đăng nhập và sử dụng hệ thống bình thường trở lại.
            </p>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (isBanning && !reason.trim())}
            className={`${isBanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Processing...' : isBanning ? 'Confirm Ban' : 'Confirm Unban'}
          </Button>
        </div>
      </div>
    </div>
  );
};