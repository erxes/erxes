import { useCallback, useEffect, useRef } from 'react';
import { useToast } from 'erxes-ui';

const GITHUB_APP_SLUG = 'erxes-operation-github-dev-test';

const GITHUB_INSTALL_URL = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;

export function useGithubInstall(onComplete: () => void) {
  const { toast } = useToast();
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  const finishInstall = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }

    popupRef.current = null;
    onCompleteRef.current();
  }, []);

  const openGithubInstall = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const width = 1020;
    const height = 618;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    popupRef.current = window.open(
      GITHUB_INSTALL_URL,
      'github-install',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    if (!popupRef.current) {
      toast({
        title: 'Could not open GitHub',
        description: 'Allow pop-ups for this site and try again.',
        variant: 'destructive',
      });
      return;
    }

    timerRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        finishInstall();
      }
    }, 1000);
  }, [finishInstall, toast]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.source === popupRef.current &&
        event.data?.type === 'github-install-complete'
      ) {
        popupRef.current?.close();
        finishInstall();
      }
    }

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [finishInstall]);

  return { openGithubInstall };
}
