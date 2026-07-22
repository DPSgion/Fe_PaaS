import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiUser, FiGithub, FiMail, FiShield, FiHash, FiLink, FiCheck, FiCalendar, FiActivity } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { userApi, type UserProfileResponse } from './api/userApi';

export const UserProfile = () => {
    const navigate = useNavigate();

    // Trạng thái loading để tránh render form khi chưa có dữ liệu
    const [isLoading, setIsLoading] = useState(true);

    // Lưu trữ toàn bộ dữ liệu gốc từ API
    const [userData, setUserData] = useState<UserProfileResponse | null>(null);

    // State cho các trường cho phép chỉnh sửa
    const [formData, setFormData] = useState({
        fullName: '',
        // Dọn đường sẵn cho tính năng upload avatar sau này
        avatarUrl: '',
    });

    // State quản lý luồng GitHub
    const [githubUsername, setGithubUsername] = useState<string | null>(null);

    // Gọi API lấy thông tin khi trang vừa load
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const data = await userApi.getMe();
                setUserData(data);

                // Đổ dữ liệu vào form cho phép sửa
                setFormData({
                    fullName: data.fullName,
                    avatarUrl: data.avatarUrl,
                });

                // Cập nhật trạng thái GitHub
                setGithubUsername(data.githubUsername);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                // TODO: Bắn Toast báo lỗi hoặc đá văng ra login nếu lỗi 401
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý kích hoạt luồng OAuth2 (Mock UI tạm thời)
    const handleConnectGithub = () => {
        console.log("Redirecting to GitHub OAuth2 page...");
        // Tạm thời set mock data để test UI
        setGithubUsername('phuong-devops');
    };

    // Xử lý hủy liên kết GitHub (Mock UI tạm thời)
    const handleDisconnectGithub = () => {
        if (window.confirm("Are you sure you want to disconnect your GitHub account? CI/CD pipelines might fail.")) {
            setGithubUsername(null);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        // Chặn hành vi reload mặc định của Form HTML
        e.preventDefault();

        try {
            const payload = {
                fullName: formData.fullName,
            };

            // 1. Gọi API cập nhật xuống Spring Boot
            await userApi.updateProfile(payload);

            // 2. Bắn thông báo (Lúc này form đã hết lỗi nổi bọt, sẽ chỉ hiện 1 lần)
            window.alert("Cập nhật thông tin cá nhân thành công!");

            // 3. Ép trình duyệt tải lại toàn bộ trang web để Header ăn tên mới
            window.location.reload();

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Lỗi hệ thống. Không thể cập nhật thông tin lúc này.';
            window.alert(errorMessage);
        }
    };

    // State cho luồng đổi mật khẩu
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });


    const [passwordError, setPasswordError] = useState('');
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError(''); // Xóa lỗi khi người dùng gõ lại
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate cơ bản ở Frontend (Chặn ngay tại cửa)
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }
        if (passwordData.oldPassword === passwordData.newPassword) {
            setPasswordError('Mật khẩu mới không được trùng với mật khẩu cũ!');
            return;
        }

        try {
            // 2. Gọi API thực tế xuống Spring Boot
            const successMessage = await userApi.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            // 3. Xử lý thành công theo đúng yêu cầu Backend
            // Hiển thị text từ Backend trả về ("Đổi mật khẩu thành công!...")
            window.alert(successMessage || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

            // 4. Xóa session hiện tại và ép đăng nhập lại
            localStorage.removeItem('paas_user');

            // Ép tải lại trang để Axios Interceptor dọn dẹp các header cũ nếu có, bay về /login
            window.location.href = '/login';

        } catch (err: any) {
            // 5. Bắt các lỗi BusinessException (400, 404) từ Backend trả lên
            // Spring Boot thường trả lỗi trong err.response.data.message hoặc err.response.data
            const errorMessage = err.response?.data?.message || err.response?.data || 'Lỗi hệ thống. Không thể đổi mật khẩu lúc này.';
            setPasswordError(errorMessage);
        }
    };

    const handleLinkGithub = () => {
        // 1. Khai báo Client ID của app GitHub bạn đã tạo
        const GITHUB_CLIENT_ID = 'Ov23linZs1mca51AJVje';

        // 2. Đường dẫn Frontend hứng kết quả (Phải khớp với Authorization callback URL trên GitHub)
        const REDIRECT_URI = 'http://localhost:5173/github/callback';

        // 3. Chuyển hướng người dùng sang GitHub để xin quyền
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;

        window.location.href = githubAuthUrl;
    };

    // Hiển thị màn hình chờ trong lúc gọi API
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <Link
                to="/my-projects"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
            >
                <FiArrowLeft /> Back to My Projects
            </Link>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân và thiết lập tài khoản liên kết.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div>

                    {/* Cover Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                    {/* Avatar Profile Section */}
                    <div className="px-8 pb-6 flex flex-col items-center -mt-16">
                        <div className="relative group">
                            <img
                                src={formData.avatarUrl || "https://api.dicebear.com/8.x/notionists/svg?seed=fallback"}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
                            />
                            <button
                                type="button"
                                className="absolute bottom-1 right-1 bg-indigo-600 p-2 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white cursor-pointer"
                                title="Change Avatar"
                            >
                                <FiCamera size={18} />
                            </button>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-gray-900">{formData.fullName}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                {userData.role}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${userData.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {userData.status}
                            </span>
                        </div>
                    </div>

                    <div className="px-8 pb-8 space-y-6">
                        {/* ========================================================= */}
                        {/* SECTION 1: EDITABLE INFORMATION                           */}
                        {/* ========================================================= */}
                        <form id="profile-update-form" onSubmit={handleUpdateProfile} className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Information</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </form>

                        {/* ========================================================= */}
                        {/* SECTION 2: CONNECTED ACCOUNTS                             */}
                        {/* ========================================================= */}
                        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Liên kết tài khoản GitHub</h4>
                                {githubUsername ? (
                                    <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                                        <FiLink /> Tài khoản hiện tại: <strong className="text-gray-900">@{githubUsername}</strong>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Sử dụng để cấp quyền truy cập vào các repository của bạn.</p>
                                )}
                            </div>

                            {githubUsername ? (
                                // Nút trạng thái vô hiệu hóa (disabled)
                                <button
                                    type="button"
                                    disabled
                                    className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed opacity-80"
                                >
                                    <FiCheck size={18} /> Đã liên kết
                                </button>
                            ) : (
                                // Nút liên kết (chỉ hiện khi chưa có githubUsername)
                                <button
                                    type="button"
                                    onClick={handleLinkGithub}
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                                >
                                    <FiGithub size={18} /> Link GitHub
                                </button>
                            )}
                        </div>

                        {/* ========================================================= */}
                        {/* SECTION 3: SECURITY (ĐỔI MẬT KHẨU)                          */}
                        {/* ========================================================= */}
                        <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <FiShield className="text-indigo-500" /> Security
                            </h4>

                            {/* Lưu ý: Form đổi mật khẩu phải độc lập với Form đổi thông tin ở trên */}
                            <form onSubmit={handleSubmitPassword} className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Current Password</label>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {passwordError && (
                                    <p className="text-xs text-red-600 font-medium">{passwordError}</p>
                                )}

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        className="bg-gray-900 hover:bg-black text-white text-xs px-4 py-2"
                                        disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* ========================================================= */}
                        {/* SECTION 4: READ-ONLY SYSTEM DATA                          */}
                        {/* ========================================================= */}
                        <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <FiShield className="text-gray-400" /> System Information (Read-only)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">System Username</label>
                                    <div className="relative">
                                        <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userData.username}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Joined Date</label>
                                    <div className="relative">
                                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={new Date(userData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Account Status</label>
                                    <div className="relative">
                                        <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={userData.status}
                                            disabled
                                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========================================================= */}
                    {/* ACTION FOOTER                                             */}
                    {/* ========================================================= */}
                    <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex flex-col-reverse md:flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="w-full md:w-auto cursor-pointer"
                        >
                            Cancel
                        </Button>

                        {/* Mấu chốt nằm ở đây: Dùng thuộc tính form="id" để nối nút này với form ở tuốt bên trên */}
                        <Button
                            type="submit"
                            form="profile-update-form"
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer font-semibold"
                            disabled={!formData.fullName.trim()}
                        >
                            Update Profile
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};