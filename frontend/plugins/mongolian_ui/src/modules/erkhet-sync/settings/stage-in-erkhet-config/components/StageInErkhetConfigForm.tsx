import { SalesForm } from './sales/SalesForm';
import { SalesAreTentativeForm } from './sales-are-tentative/SalesAreTentativeForm';

export const StageInErkhetConfigForm = () => {
  return (
    <div className="h-full w-full mx-auto max-w-6xl flex flex-col gap-10 overflow-y-auto">
      <SalesAreTentativeForm />
      <SalesForm />
    </div>
  );
};
