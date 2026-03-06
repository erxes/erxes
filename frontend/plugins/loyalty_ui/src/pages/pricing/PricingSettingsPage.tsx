import { PageContainer } from 'erxes-ui';
import { Route, Routes } from 'react-router';
import { PricingView } from '@/pricing/components/PricingView';
import { PricingEditPage } from './PricingEditPage';

const PricingSettings = () => {
  return (
    <Routes>
      <Route
        index
        element={
          <PageContainer>
            <PricingView />
          </PageContainer>
        }
      />
      <Route path=":id" element={<PricingEditPage />} />
    </Routes>
  );
};

export default PricingSettings;
