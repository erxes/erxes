import { ReactNode } from 'react';
import { IBranch } from '@/tms/types/branch';
import { TourPage } from '@/tms/branch-detail/dashboard/pages/TourPage';
import { ItineraryPage } from '@/tms/branch-detail/dashboard/pages/ItineraryPage';
import { ElementsPage } from '@/tms/branch-detail/dashboard/pages/ElementsPage';
import { AmenitiesPage } from '@/tms/branch-detail/dashboard/pages/AmenitiesPage';
import { CategoryPage } from '@/tms/branch-detail/dashboard/pages/CategoryPage';

interface MainContentProps {
  activeStep: string;
  branch: IBranch;
}

export const MainContent = ({ activeStep, branch }: MainContentProps) => {
  const renderContent = (): ReactNode => {
    switch (activeStep) {
      case 'tour':
        return <TourPage branch={branch} />;
      case 'category':
        return <CategoryPage />;
      case 'itinerary':
        return <ItineraryPage branch={branch} />;
      case 'elements':
        return <ElementsPage branch={branch} />;
      case 'amenities':
        return <AmenitiesPage branch={branch} />;
      default:
        return <TourPage branch={branch} />;
    }
  };

  return <div className="overflow-auto flex-1">{renderContent()}</div>;
};
