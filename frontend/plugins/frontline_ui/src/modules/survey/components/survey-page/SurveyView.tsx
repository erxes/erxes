import { PageContainer } from 'erxes-ui';
import { Outlet } from 'react-router';
import { SurveyPageHeader } from '@/survey/components/survey-page/SurveyPageHeader';

export const SurveyView = () => (
  <PageContainer>
    <SurveyPageHeader />
    <Outlet />
  </PageContainer>
);
