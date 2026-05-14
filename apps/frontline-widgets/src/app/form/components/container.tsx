import { useEffect, useRef } from 'react';
import { postMessage } from '@libs/utils';

export const Container = ({
  children,
  settings,
  loading,
}: {
  children: React.ReactNode;
  settings: { form_id: string; channel_id: string };
  loading: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || loading) return;
    const el = ref.current;
    const observer = new ResizeObserver(() => {
      postMessage('fromForms', 'changeContainerStyle', {
        style: `height: ${el.scrollHeight}px;`,
        settings,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [settings, loading]);

  return <div ref={ref}>{children}</div>;
};
