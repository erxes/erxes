import {
  appPlacesState,
  lastAppIdState,
} from '@/navigation/states/appPlacesState';
import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';
import { Navigate } from 'react-router-dom';

/** Opening erxes lands in the app and page you last worked in. */
export const ResumeLastApp = () => {
  const places = useAtomValue(appPlacesState);
  const lastAppId = useAtomValue(lastAppIdState);

  return (
    <Navigate
      to={(lastAppId && places[lastAppId]) || `/${AppPath.Home}`}
      replace
    />
  );
};
