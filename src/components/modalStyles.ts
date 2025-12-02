import type { CSSProperties } from 'react';

export const getModalStyle = (isExpanded: boolean): CSSProperties => {
    if (isExpanded) {
        return {
            position: 'fixed' as const,
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            left: 0,
            top: 0,
            transform: 'none'
        };
    }
    return {
        position: 'fixed' as const,
        zIndex: 9999,
        width: '500px',
        left: '50%',
        top: '10%',
        transform: 'translateX(-50%)',
        maxHeight: '80vh'
    };
};
