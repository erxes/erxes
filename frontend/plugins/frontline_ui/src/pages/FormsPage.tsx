import { FormsList } from '@/forms/components/FormsList';
import { useEffect } from 'react';

export const FormsPage = () => {
  useEffect(() => {
    import('./FormDetailPage');
  }, []);

  return <FormsList />;
};
