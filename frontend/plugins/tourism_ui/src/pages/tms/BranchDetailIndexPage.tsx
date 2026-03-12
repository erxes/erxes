import { IconBox } from '@tabler/icons-react';
import { Breadcrumb, Button, Select, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useSearchParams } from 'react-router-dom';

import { BranchDetailView } from '@/tms/branch-detail/components/BranchDetailView';
import { useBranchDetailPage } from '@/tms/branch-detail/hooks/useBranchDetailPage';

import { TourCreateSheet } from '@/tms/branch-detail/dashboard/tours/_components/TourCreateSheet';
import { ItineraryCreateSheet } from '@/tms/branch-detail/dashboard/itinerary/_components/ItineraryCreateSheet';
import { ElementCreateSheet } from '@/tms/branch-detail/dashboard/elements/_components/ElementCreateSheet';
import { AmenityCreateSheet } from '@/tms/branch-detail/dashboard/amenities/_components/AmenityCreateSheet';

export const BranchDetailIndexPage = () => {
  const [searchParams] = useSearchParams();

  const {
    branchId,
    list,
    selectedBranch,
    listLoading,
    onSelectBranch,
    basePath,
  } = useBranchDetailPage();

  const activeTab = searchParams.get('activeTab') || 'tour';

  const renderCreateSheet = () => {
    if (!branchId) return null;

    switch (activeTab) {
      case 'tour':
        return <TourCreateSheet branchId={branchId} />;

      case 'itinerary':
        return <ItineraryCreateSheet branchId={branchId} />;

      case 'elements':
        return <ElementCreateSheet branchId={branchId} />;

      case 'amenities':
        return <AmenityCreateSheet branchId={branchId} />;

      default:
        return <TourCreateSheet branchId={branchId} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={basePath}>
                    <IconBox />
                    Tour management system
                  </Link>
                </Button>
              </Breadcrumb.Item>

              <Breadcrumb.Separator />

              <Breadcrumb.Item>
                <Select value={branchId || ''} onValueChange={onSelectBranch}>
                  <Select.Trigger className="w-[240px]">
                    <Select.Value
                      placeholder={
                        listLoading
                          ? 'Loading branches...'
                          : selectedBranch?.name || 'Select branch'
                      }
                    />
                  </Select.Trigger>

                  <Select.Content>
                    {list.map((branch) => (
                      <Select.Item key={branch._id} value={branch._id}>
                        {branch.name || 'Unnamed Branch'}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>

          <Separator.Inline />

          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>

        <PageHeader.End>{renderCreateSheet()}</PageHeader.End>
      </PageHeader>

      <BranchDetailView />
    </div>
  );
};
