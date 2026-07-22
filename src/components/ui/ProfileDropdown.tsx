// src/components/ui/ProfileDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { authApi } from '../../features/auth/api/authApi';
import { userApi, type UserProfileResponse } from '../../features/profile/api/userApi';
import Swal from 'sweetalert2';

export const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 1. Khởi tạo State để hứng dữ liệu từ Backend
    const [userData, setUserData] = useState<UserProfileResponse | null>(null);

    // 2. Gọi API lấy thông tin khi Header vừa được render
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userApi.getMe();
                setUserData(data);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };
        fetchUser();
    }, []);

    // Logic click ra ngoài (Click outside)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận đăng xuất?',
            text: "Bạn có chắc chắn muốn thoát khỏi hệ thống?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await authApi.logout();
            } catch (error) {
                console.error("Logout API failed, but forcing client-side clear.", error);
            } finally {
                localStorage.removeItem('paas_user');
                navigate('/login');
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 3. Render động dữ liệu (Sử dụng Optional Chaining ?. để tránh crash nếu dữ liệu chưa kịp về) */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 transition-colors select-none"
            >
                <img
                    src={userData?.avatarUrl || "https://api.dicebear.com/8.x/notionists/svg?seed=fallback"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border border-gray-200 object-cover bg-white"
                />
                <div className="hidden md:block text-left">
                    {/* Hiển thị FullName, nếu API chưa về kịp thì hiện chữ Loading... */}
                    <div className="font-semibold text-sm text-gray-800 leading-tight">
                        {userData?.fullName || 'Loading...'}
                    </div>
                    {/* Hiển thị Role */}
                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {userData?.role || '...'}
                    </div>
                </div>
                <FiChevronDown
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Dropdown Menu (Giữ nguyên không đổi) */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2">
                        <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                            <FiUser size={16} />
                            Update information
                        </Link>
                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        >
                            <FiLogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};