import { useEffect } from 'react';

export const FBAuth = () => {
  useEffect(() => {
    window.close();
  }, []);

  return (
    <div className="h-dvh w-dvh flex items-center justify-center text-center">
      Facebook authorized, You can close this window
    </div>
  );
};
