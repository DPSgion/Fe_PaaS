import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { githubApi } from './api/githubApi';
import { FiLoader } from 'react-icons/fi';

export const GithubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Dùng useRef để chặn React 18 gọi API 2 lần trong chế độ StrictMode
  const hasFetched = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      window.alert("Không tìm thấy mã xác thực từ GitHub!");
      navigate('/profile');
      return;
    }

    const processGithubLogin = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const result = await githubApi.linkAccount(code);
        window.alert(result.message || `Đã liên kết thành công với tài khoản: ${result.githubUsername}`);
        
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Lỗi liên kết GitHub. Vui lòng thử lại sau.';
        window.alert(errorMessage);
      } finally {
        // Xử lý xong (dù thành công hay thất bại) cũng đá người dùng về lại Profile
        window.location.href = '/profile';
      }
    };

    processGithubLogin();
  }, [searchParams, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <FiLoader className="animate-spin text-gray-900 mb-4" size={40} />
      <h2 className="text-xl font-bold text-gray-900">Đang liên kết với GitHub...</h2>
      <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng trình duyệt lúc này.</p>
    </div>
  );
};