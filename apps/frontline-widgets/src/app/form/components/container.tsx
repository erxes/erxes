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
    new ResizeObserver(() => {
      if (ref.current && !loading) {
        postMessage('fromForms', 'changeContainerStyle', {
          style: `height: ${ref.current.scrollHeight}px;`,
          settings,
        });
      }
    }).observe(ref.current as Element);
  }, [ref.current?.scrollHeight, children, settings, loading]);

  return <div ref={ref}>{children}</div>;
};
