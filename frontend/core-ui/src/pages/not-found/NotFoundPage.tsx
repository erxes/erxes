import { useNavigate } from 'react-router-dom';

import { Button } from 'erxes-ui';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
      <Button variant="link" onClick={() => navigate('/')}>
        Go back
      </Button>
    </div>
  );
};
