import { useState, useEffect, useMemo, useRef } from 'react';
import { FiSave, FiAlertTriangle, FiLoader, FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';
import { projectApi, type ProjectUpdateRequest, type ProjectDetailResponse, type GithubBranch } from '../api/projectApi';
import toast from 'react-hot-toast';

interface ProjectSettingsTabProps {
    projectId: string | number;
    initialData: ProjectDetailResponse;
    onUpdateSuccess: () => void;
}

export const ProjectSettingsTab = ({ projectId, initialData, onUpdateSuccess }: ProjectSettingsTabProps) => {
    const [isSaving, setIsSaving] = useState(false);
    
    // Các state nhập liệu
    const [projectName, setProjectName] = useState(initialData.projectName || '');
    const [branch, setBranch] = useState(initialData.branch || '');
    const [targetPort, setTargetPort] = useState<string>(initialData.targetPort?.toString() || '');
    const [rootDirectory, setRootDirectory] = useState(initialData.rootDirectory || '');

    // State phục vụ Dropdown Branch
    const [branches, setBranches] = useState<GithubBranch[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
    const [branchSearchQuery, setBranchSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Xử lý đóng Dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsBranchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tự động bóc tách URL GitHub để lấy Owner và Repo, sau đó gọi API lấy nhánh
    useEffect(() => {
        const fetchBranches = async () => {
            if (!initialData.githubUrl) return;
            
            let owner = "";
            let repo = "";
            
            try {
                // Ví dụ URL: https://github.com/phuong-devops/cupzone
                const url = new URL(initialData.githubUrl);
                const pathParts = url.pathname.split('/').filter(Boolean);
                if (pathParts.length >= 2) {
                    owner = pathParts[0];
                    repo = pathParts[1].replace('.git', ''); // Đề phòng dính đuôi .git
                }
            } catch (e) {
                console.error("URL GitHub không hợp lệ", e);
                return;
            }

            if (!owner || !repo) return;

            setIsLoadingBranches(true);
            try {
                const branchData = await projectApi.getRepoBranches(owner, repo);
                setBranches(branchData);
            } catch (error) {
                console.error("Lỗi lấy danh sách nhánh", error);
            } finally {
                setIsLoadingBranches(false);
            }
        };
        
        fetchBranches();
    }, [initialData.githubUrl]);

    // Lọc nhánh khi Search
    const filteredBranches = useMemo(() => {
        if (!branchSearchQuery.trim()) return branches;
        return branches.filter(b => b.name.toLowerCase().includes(branchSearchQuery.toLowerCase()));
    }, [branches, branchSearchQuery]);

    // Xử lý Submit Form
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!projectName.trim() || !branch.trim() || !targetPort) {
            toast.error("Vui lòng nhập đầy đủ Tên dự án, Nhánh và Port!");
            return;
        }

        setIsSaving(true);
        try {
            const payload: ProjectUpdateRequest = {
                projectName: projectName,
                branch: branch,
                targetPort: parseInt(targetPort, 10),
                rootDirectory: rootDirectory.trim() === '' ? null : rootDirectory.trim()
            };

            const message = await projectApi.updateProjectSettings(projectId, payload);
            toast.success(message); 
            onUpdateSuccess(); 
            
        } catch (error: any) {
            const msg = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật cấu hình.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300 max-w-3xl">
            <div>
                <h3 className="text-lg font-bold text-gray-900">General Settings</h3>
                <p className="text-sm text-gray-500">Cập nhật thông tin cơ bản và cấu hình môi trường khởi chạy.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm">
                <FiAlertTriangle className="shrink-0 mt-0.5" size={16} />
                <p>
                    <strong>Lưu ý:</strong> Bất kỳ sự thay đổi nào tại đây cũng yêu cầu bạn phải bấm nút <strong>Redeploy</strong> ở góc trên bên phải màn hình để hệ thống áp dụng cấu hình mới.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                
                {/* Project Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Project Name</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value.replace(/[_ ]/g, '-'))}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Branch (Dropdown) */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Production Branch</label>
                        <button
                            type="button"
                            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm flex items-center justify-between hover:bg-gray-100 transition-all font-mono cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {branch || 'Chọn nhánh...'}
                            </span>
                            {isLoadingBranches ? <FiLoader className="animate-spin text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                        </button>

                        {isBranchDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 border-b border-gray-100">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Tìm nhánh..."
                                            value={branchSearchQuery}
                                            onChange={(e) => setBranchSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredBranches.length > 0 ? (
                                        <ul className="py-1">
                                            {filteredBranches.map((b) => (
                                                <li 
                                                    key={b.name}
                                                    onClick={() => {
                                                        setBranch(b.name);
                                                        setIsBranchDropdownOpen(false);
                                                        setBranchSearchQuery('');
                                                    }}
                                                    className="px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center justify-between font-mono transition-colors"
                                                >
                                                    {b.name}
                                                    {branch === b.name && <FiCheck className="text-indigo-600" />}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            {isLoadingBranches ? 'Đang tải nhánh...' : 'Không tìm thấy nhánh phù hợp.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target Port */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Target Port</label>
                        <input
                            type="number"
                            min="1"
                            max="65535"
                            value={targetPort}
                            onChange={(e) => setTargetPort(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Root Directory */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Root Directory</label>
                    <div className="flex rounded-lg shadow-sm">
                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-mono font-bold">
                            ./
                        </span>
                        <input
                            type="text"
                            placeholder="e.g. backend/src (Bỏ trống nếu là thư mục gốc)"
                            value={rootDirectory}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (val.startsWith('/')) val = val.substring(1);
                                val = val.replace(/\.\./g, '');
                                setRootDirectory(val);
                            }}
                            className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg bg-gray-50 border border-gray-300 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || !projectName.trim() || !branch.trim() || !targetPort}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </button>
                </div>
            </form>
        </div>
    );
};