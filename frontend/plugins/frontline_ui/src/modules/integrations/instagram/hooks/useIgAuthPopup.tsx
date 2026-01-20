
import { useEffect, useRef, useState } from 'react';
import { RETRY_EXPORT } from 'ui-modules/modules/import-export/graphql/export/exportMutations';

export const useIgAuthPopup = ( onClose?: () => void) => {
    const popupRef = useRef<Window | null>(null);
    const[isPopupOpen, setIsPopupOpen] = useState(false);

    const popupWindow = (url: string, title: string, w: number, h: number) => {
        const dualScreenLeft = window.screenLeft ?? window.screenX;
        const dualScreenTop = window.screenTop ?? window.screenY;
        const width = 
            window.innerWidth ??
            document.documentElement.clientWidth ??
            window.screen.width;
        const height = 
            window.innerHeight ??
            document.documentElement.clientHeight ??
            window.screen.height;
        const left = width / 2 - w / 2 + dualScreenLeft;
        const top = height / 2 - h / 2 + dualScreenTop;

        const popup = window.open(
            url,
            title,
            `toolbar=no, location=no, directions=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${w}, height=${h}, top=${top}, left=${left}`,
        );

        if (popup){
            popupRef.current = popup;
            setIsPopupOpen(true);
        }
    };

    useEffect(()=>{
        if (!isPopupOpen) return;
        const timer = setInterval(() =>{
            if(popupRef.current && popupRef.current.closed){
                clearInterval(timer);
                setIsPopupOpen(false);
                onClose?.();
            }
        }, 500);
        return () => clearInterval(timer);
    });

    return { popupWindow, isPopupOpen};

}