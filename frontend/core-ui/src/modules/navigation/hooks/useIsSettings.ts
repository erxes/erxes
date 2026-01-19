import { useLocation } from 'react-router';

export const useIsSettings = () => {
  const location = useLocation();
  return location.pathname.includes('/settings');
};
