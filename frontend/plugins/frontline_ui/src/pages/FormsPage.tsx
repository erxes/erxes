import { ChannelFormsSubHeader } from '@/channels/components/settings/channel-details/ChannelFormsSubHeader';
import { FormsList } from '@/forms/components/FormsList';
import { useEffect } from 'react';

export const FormsPage = () => {
  useEffect(() => {
    import('./FormDetailPage');
  }, []);

  return (
    <>
      <ChannelFormsSubHeader />
      <FormsList />
    </>
  );
};
