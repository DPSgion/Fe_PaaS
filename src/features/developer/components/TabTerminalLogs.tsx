export const TabTerminalLogs = () => {
    return (
        <div className="animate-in fade-in duration-300 p-4">
            <div className="bg-gray-950 rounded-lg shadow-inner p-4
h-[400px] overflow-y-auto font-mono text-sm">

                <div className="text-gray-500 mb-4">Connected to container

                    logging stream...</div>

                <div className="text-green-400">[info] Server starting on port

                    8080</div>

                <div className="text-green-400">[info] Connecting to

                    database...</div>

                <div className="text-green-400">[info] Database connected

                    successfully.</div>

                <div className="text-yellow-400">[warn] Missing optional ENV

                    variable: REDIS_URL</div>

                <div className="text-green-400">[info] App is running and

                    ready to receive requests.</div>

                <div className="mt-2 text-gray-300 flex items-center">
                    <span className="text-blue-400 mr-2">root@paas:/app#</span>

                    <span className="w-2 h-4 bg-gray-300 animate-pulse"></span>

                </div>
            </div>
        </div>
    );
};