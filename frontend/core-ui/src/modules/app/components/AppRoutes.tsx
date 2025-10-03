import { RouterProvider } from 'react-router-dom';

import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';

export const AppRouter = () => {
  return <RouterProvider router={useCreateAppRouter()} />;
};
