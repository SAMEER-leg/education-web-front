import { motion } from 'motion/react';
import { useSettings } from '../../contexts/SettingsContext';

const PageLoading = () => {
    const { settings } = useSettings();

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-20 bg-[#0B0B0D]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                    <img
                        src={settings?.branding?.logo || settings?.branding?.favicon || '/logo.png'}
                        alt="Loading..."
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(6,181,204,0.6)] animate-pulse"
                    />
                    <div className="absolute inset-0 bg-[#06b5cc]/10 blur-2xl rounded-full -z-10 animate-pulse" />
                </div>
                <div className="w-12 h-1 border-2 border-white/5 border-t-[#06b5cc] rounded-full animate-spin mt-4" />
            </motion.div>
        </div>
    );
};

export default PageLoading;
