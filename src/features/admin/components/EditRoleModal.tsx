import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { type AdminUser } from '../api/adminApi';

interface EditRoleModalProps {
  user: AdminUser;
  onClose: () => void;
  // Khai báo hàm nhận 2 tham số để truyền ngược lên cho Cha
  onUpdate: (userId: number, newRole: string) => Promise<void>; 
}

export const EditRoleModal = ({ user, onClose, onUpdate }: EditRoleModalProps) => {
  const [selectedNewRole, setSelectedNewRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Gọi hàm của Cha truyền vào
    await onUpdate(user.id, selectedNewRole);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-orange-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Edit Role</h3>
          <p className="text-xs text-gray-500 mt-1">Editing user: <strong className="text-gray-800">{user.username}</strong></p>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select new role:</label>
          <select 
            value={selectedNewRole}
            onChange={(e) => setSelectedNewRole(e.target.value)}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
          >
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={selectedNewRole === user.role || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : 'Update Role'}
          </Button>
        </div>
      </div>
    </div>
  );
};