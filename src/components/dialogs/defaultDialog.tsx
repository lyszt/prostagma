import { type FC } from "react";
import { useEffect, useState } from "react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface DefaultDialogProps {
    innerText: string;
}

const DEFAULT_AUTO_CLOSE = 2000;

const DefaultDialog: FC<DefaultDialogProps> = ({ innerText }) => {
    const [mounted, setMounted] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 20);
        const fadeOutAt = setTimeout(() => setVisible(false), DEFAULT_AUTO_CLOSE);
        const unmountAt = setTimeout(() => setMounted(false), DEFAULT_AUTO_CLOSE + 300);

        return () => {
            clearTimeout(t);
            clearTimeout(fadeOutAt);
            clearTimeout(unmountAt);
        };
    }, []);

        if (!mounted) return null;

        return (
            <div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none">
                <span
                    role="status"
                    aria-live="polite"
                        className={`pointer-events-auto p-5 text-slate-800 bg-gray-200 rounded transition-all duration-300 ease-out transform ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2"}`}
                >
                        <div className="flex items-start gap-2">
                            <InfoOutlinedIcon fontSize="small" sx={{ color: 'var(--iris-primary)' }} aria-hidden="true" />
                            <div className="text-sm leading-tight">{innerText}</div>
                        </div>
                </span>
            </div>
        );
};

export default DefaultDialog;