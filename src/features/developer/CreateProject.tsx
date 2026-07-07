import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiGithub, FiLock, FiGlobe, FiArrowRight, FiLoader, FiArrowLeft, FiChevronDown, FiCheck } from 'react-icons/fi';
import { projectApi, type GithubRepo, type GithubBranch } from './api/projectApi';

export const CreateProject = () => {
    const navigate = useNavigate();

    // =========================================================
    // STATE - STEP 1: DANH SÁCH REPOSITORY
    // =========================================================
    const [step, setStep] = useState<1 | 2>(1);
    const [repos, setRepos] = useState<GithubRepo[]>([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [repoSearchQuery, setRepoSearchQuery] = useState('');

    // =========================================================
    // STATE - STEP 2: CẤU HÌNH PROJECT & BRANCH
    // =========================================================
    const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
    const [projectName, setProjectName] = useState('');
    
    const [branches, setBranches] = useState<GithubBranch[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('');
    
    // Quản lý trạng thái của Searchable Dropdown
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
    const [branchSearchQuery, setBranchSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isDeploying, setIsDeploying] = useState(false);

    // =========================================================
    // EFFECTS & LOGIC
    // =========================================================

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const data = await projectApi.getMyRepositories();
                setRepos(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách repository", error);
                window.alert("Không thể kết nối với GitHub. Vui lòng kiểm tra lại cấu hình liên kết ở Profile.");
            } finally {
                setIsLoadingRepos(false);
            }
        };
        fetchRepos();
    }, []);

    const filteredRepos = useMemo(() => {
        if (!repoSearchQuery.trim()) return repos;
        return repos.filter(repo =>
            repo.full_name.toLowerCase().includes(repoSearchQuery.toLowerCase())
        );
    }, [repos, repoSearchQuery]);

    const filteredBranches = useMemo(() => {
        if (!branchSearchQuery.trim()) return branches;
        return branches.filter(branch =>
            branch.name.toLowerCase().includes(branchSearchQuery.toLowerCase())
        );
    }, [branches, branchSearchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsBranchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // =========================================================
    // HANDLERS
    // =========================================================

    const handleSelectRepo = async (repo: GithubRepo) => {
        setSelectedRepo(repo);
        setProjectName(repo.name); 
        setSelectedBranch(repo.default_branch); 
        setStep(2);
        setBranchSearchQuery(''); 

        const [owner, repoName] = repo.full_name.split('/');
        
        setIsLoadingBranches(true);
        try {
            const branchData = await projectApi.getRepoBranches(owner, repoName);
            setBranches(branchData);
        } catch (error) {
            console.error("Lỗi lấy danh sách nhánh", error);
            window.alert("Không thể tải danh sách nhánh từ GitHub.");
        } finally {
            setIsLoadingBranches(false);
        }
    };

    const handleBackToRepos = () => {
        setStep(1);
        setSelectedRepo(null);
        setBranches([]);
    };

    const handleDeploy = async () => {
        if (!selectedRepo || !projectName.trim() || !selectedBranch) return;

        setIsDeploying(true);
        try {
            const payload = {
                projectName: projectName,
                repoFullName: selectedRepo.full_name, // VD: phuong-devops/cupzone
                branch: selectedBranch // VD: main
            };

            // Gọi API thực tế
            const result: any = await projectApi.importProject(payload);
            
            // LƯU Ý KỸ THUẬT:
            // Backend của bạn hiện tại hàm importProject chỉ trả về thực thể Project (có result.id).
            // Nó chưa tạo ra Environment (Môi trường) cho Project này. 
            // Để Frontend không bị lỗi trắng trang khi gọi URL, tạm thời tôi gán envId = 'default'.
            navigate(`/project/${result.id}/env/default`);

        } catch (error: any) {
            console.error("Lỗi khi tạo project", error);
            // Hiển thị chính xác câu chửi (BusinessException 400, 401) từ Spring Boot trả lên
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi khởi tạo dự án.";
            window.alert(errorMessage);
            setIsDeploying(false);
        }
    };

    // =========================================================
    // RENDER UI
    // =========================================================

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Let's build something new.</h2>
                <p className="text-gray-500 mt-2">
                    {step === 1 ? 'Chọn một Repository từ GitHub để bắt đầu quá trình triển khai.' : 'Xác nhận cấu hình mã nguồn trước khi triển khai.'}
                </p>
            </div>

            {/* SỬA GẮT 1: Bỏ overflow-hidden ở thẻ bao ngoài cùng để Dropdown thò ra ngoài thoải mái */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm relative min-h-[400px]">
                
                {/* ======================= BƯỚC 1: CHỌN REPO ======================= */}
                {step === 1 && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300 flex flex-col h-full">
                        {/* Header của form Bước 1 (Bo góc trên) */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                            <div className="relative">
                                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm repository..."
                                    value={repoSearchQuery}
                                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                                    disabled={isLoadingRepos}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Repo List (Bo góc dưới) */}
                        <div className="flex-1">
                            {isLoadingRepos ? (
                                <div className="flex flex-col items-center justify-center h-[350px] text-gray-400 gap-3 rounded-b-2xl">
                                    <FiLoader className="animate-spin" size={32} />
                                    <p className="text-sm font-medium">Đang tải danh sách từ GitHub...</p>
                                </div>
                            ) : filteredRepos.length > 0 ? (
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto rounded-b-2xl">
                                    {filteredRepos.map((repo) => (
                                        <div key={repo.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 border border-gray-200">
                                                    <FiGithub size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">{repo.name}</h3>
                                                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${repo.private ? 'text-gray-500 bg-gray-100 border-gray-200' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                                            {repo.private ? <FiLock size={10} /> : <FiGlobe size={10} />}
                                                            {repo.private ? 'Private' : 'Public'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <p>{repo.full_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSelectRepo(repo)}
                                                className="bg-white border border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
                                            >
                                                Import
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[350px] text-gray-500 gap-4 rounded-b-2xl">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                                        <FiSearch size={24} className="text-gray-400" />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-base font-bold text-gray-900">Không tìm thấy Repository</h4>
                                        <p className="text-sm mt-1 max-w-sm">Không có dự án nào khớp với từ khóa "{repoSearchQuery}".</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======================= BƯỚC 2: CẤU HÌNH & DEPLOY ======================= */}
                {step === 2 && selectedRepo && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex flex-col h-full min-h-[400px]">
                        
                        {/* Header của form (Bo góc trên) */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50 rounded-t-2xl">
                            <button 
                                onClick={handleBackToRepos}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 cursor-pointer"
                            >
                                <FiArrowLeft size={20} />
                            </button>
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FiGithub /> {selectedRepo.full_name}
                                </h3>
                            </div>
                        </div>

                        {/* SỬA GẮT 2: Thêm `relative z-20` để ép toàn bộ thân form nằm đè lên trên cái Footer */}
                        <div className="p-8 flex-1 space-y-6 max-w-2xl relative z-20">
                            
                            {/* Cấu hình Tên Project */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                />
                                <p className="text-xs text-gray-500 mt-2">Tên dự án sẽ được dùng để tạo định danh và URL nội bộ.</p>
                            </div>

                            {/* Cấu hình Nhánh (Searchable Dropdown) */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Production Branch</label>
                                
                                <button
                                    type="button"
                                    onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm flex items-center justify-between hover:bg-gray-50 transition-all font-mono cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        {selectedBranch}
                                    </span>
                                    {isLoadingBranches ? <FiLoader className="animate-spin text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                                </button>

                                {/* SỬA GẮT 3: Tăng z-index lên z-50 và tăng shadow-2xl để Dropdown bay hẳn lên trên cùng */}
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
                                                    {filteredBranches.map((branch) => (
                                                        <li 
                                                            key={branch.name}
                                                            onClick={() => {
                                                                setSelectedBranch(branch.name);
                                                                setIsBranchDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center justify-between font-mono transition-colors"
                                                        >
                                                            {branch.name}
                                                            {selectedBranch === branch.name && <FiCheck className="text-indigo-600" />}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-gray-500">
                                                    Không tìm thấy nhánh phù hợp.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer (Bo góc dưới và hạ z-index xuống thấp hơn form body) */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl relative z-10">
                            <button
                                onClick={handleDeploy}
                                disabled={isDeploying || !projectName.trim() || !selectedBranch}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                            >
                                {isDeploying ? (
                                    <>
                                        <FiLoader className="animate-spin" /> Deploying...
                                    </>
                                ) : (
                                    'Deploy'
                                )}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};