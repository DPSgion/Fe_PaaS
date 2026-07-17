import React, { useState, useEffect } from 'react';
import { FiEye, FiLoader } from 'react-icons/fi';
import { projectApi } from '../api/projectApi';
import { DeployLogViewer } from './DeployLogViewer';

export const TabDeployHistory = ({ projectId, refreshTrigger }: { projectId: string, refreshTrigger: number }) => {
    const [histories, setHistories] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [isLast, setIsLast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDeployment, setSelectedDeployment] = useState<{ id: number, status: string } | null>(null);

    const fetchHistories = async (pageNumber: number) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const data = await projectApi.getDeployHistories(projectId, pageNumber, 20);
            if (pageNumber === 0) {
                setHistories(data.content);
            } else {
                setHistories(prev => [...prev, ...data.content]);
            }
            setIsLast(data.last);
        } catch (error) {
            console.error("Lỗi lấy lịch sử", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        fetchHistories(0);
    }, [projectId, refreshTrigger]);

    useEffect(() => {
        if (page > 0) fetchHistories(page);
    }, [page]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoading && !isLast) {
            setPage(prev => prev + 1);
        }
    };

    const renderStatus = (status: string) => {
        let colorClass = "bg-gray-100 text-gray-700 border-gray-300";
        if (status === 'SUCCESS') colorClass = "bg-green-100 text-green-700 border-green-300";
        if (status === 'FAILED') colorClass = "bg-red-100 text-red-700 border-red-300";
        if (status === 'BUILDING') colorClass = "bg-blue-100 text-blue-700 border-blue-300 animate-pulse";
        return <span className={`font-bold text-[10px] px-2 py-1 rounded border uppercase ${colorClass}`}>{status}</span>;
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="max-h-[500px] overflow-y-auto" onScroll={handleScroll}>
                <table className="w-full text-sm text-left text-gray-600 relative">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 w-48 font-bold">Time</th>
                            <th className="px-6 py-4 font-bold">Event (Status + Commit)</th>
                            <th className="px-6 py-4 w-40 whitespace-nowrap font-bold text-center">Image Size</th>
                            <th className="px-6 py-4 text-right font-bold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {histories.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 align-top">
                                    <div className="font-medium text-gray-900">
                                        {item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : 'Đang khởi tạo...'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Build: {item.buildDuration}</div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <div className="flex items-center gap-3 mb-1">
                                        {renderStatus(item.status)}
                                        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">
                                            {item.commitSha}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 mt-2 font-medium">{item.commitMessage}</p>
                                </td>
                                <td className="px-6 py-4 align-top text-center">
                                    <span className={`whitespace-nowrap font-mono text-xs px-2 py-1 rounded border ${item.imageSize ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-transparent text-gray-400 border-transparent italic'}`}>
                                        {item.imageSize || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-top text-right">
                                    <button
                                        onClick={() => setSelectedDeployment({ id: item.id, status: item.status })}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded shadow-sm transition-all cursor-pointer"
                                    >
                                        <FiEye size={14} /> View Log
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isLoading && (
                    <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin" /> Đang tải thêm dữ liệu...
                    </div>
                )}
            </div>
            <DeployLogViewer
                isOpen={selectedDeployment !== null}
                onClose={() => setSelectedDeployment(null)}
                deploymentId={selectedDeployment?.id || null}
                status={selectedDeployment?.status || 'STOPPED'}
                onDeployFinished={() => {
                    setPage(0);
                    fetchHistories(0);
                }}
            />
        </div>
    );
};