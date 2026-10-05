import { PageContainer } from 'erxes-ui';
import { SupportMessenger } from '@/welcome/components/SupportMessenger';
import { WelcomeHome } from '@/welcome/components/WelcomeHome';

export const WelcomeHomePage = () => {
  return (
    <PageContainer>
      <WelcomeHome />
      <SupportMessenger />
    </PageContainer>
  );
};
