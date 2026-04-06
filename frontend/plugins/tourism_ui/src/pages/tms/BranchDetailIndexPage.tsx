import { IconBox } from '@tabler/icons-react';
import { Breadcrumb, Button, Select, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

import { BranchDetailView } from '@/tms/branch-detail/components/BranchDetailView';
import { useBranchDetailPage } from '@/tms/branch-detail/hooks/useBranchDetailPage';
import { useActiveLang } from '@/tms/branch-detail/hooks/useActiveLang';
import { LANGUAGES } from '@/tms/constants/languages';

import { TourCreateSheet } from '@/tms/branch-detail/dashboard/tours/_components/TourCreateSheet';
import { ItineraryCreateSheet } from '@/tms/branch-detail/dashboard/itinerary';
import { ElementCreateSheet } from '@/tms/branch-detail/dashboard/elements';
import { AmenityCreateSheet } from '@/tms/branch-detail/dashboard/amenities';
import { CategoryCreateSheet } from '@/tms/branch-detail/dashboard/category';

type ActiveTab = 'tour' | 'category' | 'itinerary' | 'elements' | 'amenities';

const VALID_TABS = new Set<ActiveTab>([
  'tour',
  'category',
  'itinerary',
  'elements',
  'amenities',
]);

const CREATE_SHEET_MAP: Partial<
  Record<ActiveTab, (branchId: string) => JSX.Element>
> = {
  tour: (branchId) => <TourCreateSheet branchId={branchId} />,
};

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

  const rawTab = searchParams.get('activeTab') ?? 'tour';
  const activeTab: ActiveTab = VALID_TABS.has(rawTab as ActiveTab)
    ? (rawTab as ActiveTab)
    : 'tour';

  const availableLanguages = useMemo(() => {
    if (!Array.isArray(selectedBranch?.languages)) return [];
    return selectedBranch.languages
      .map((code) => LANGUAGES.find((lang) => lang.value === code))
      .filter((lang): lang is NonNullable<typeof lang> => lang != null);
  }, [selectedBranch?.languages]);

  const availableLangCodes = useMemo(
    () => availableLanguages.map((l) => l.value),
    [availableLanguages],
  );

  const { activeLang, setActiveLang } = useActiveLang({
    branchId,
    mainLanguage: selectedBranch?.language,
    availableLanguages: availableLangCodes,
  });

  const onSelectLanguage = (lang: string) => {
    setActiveLang(lang);
  };

  const renderCreateSheet = () => {
    if (!branchId) return null;
    if (activeTab === 'itinerary') {
      return (
        <ItineraryCreateSheet
          branchId={branchId}
          branchLanguages={selectedBranch?.languages}
          mainLanguage={selectedBranch?.language}
        />
      );
    }
    if (activeTab === 'elements') {
      return (
        <ElementCreateSheet
          branchId={branchId}
          branchLanguages={selectedBranch?.languages}
          mainLanguage={selectedBranch?.language}
        />
      );
    }
    if (activeTab === 'amenities') {
      return (
        <AmenityCreateSheet
          branchId={branchId}
          branchLanguages={selectedBranch?.languages}
          mainLanguage={selectedBranch?.language}
        />
      );
    }
    if (activeTab === 'category') {
      return (
        <CategoryCreateSheet
          branchId={branchId}
          branchLanguages={selectedBranch?.languages}
          mainLanguage={selectedBranch?.language}
        />
      );
    }
    return CREATE_SHEET_MAP[activeTab]?.(branchId) ?? null;
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-2">
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
                  <Select.Trigger className="w-60">
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

              {availableLanguages.length > 0 && (
                <>
                  <Breadcrumb.Separator />

                  <Breadcrumb.Item>
                    <Select value={activeLang} onValueChange={onSelectLanguage}>
                      <Select.Trigger className="w-[180px]">
                        <Select.Value placeholder="Select language" />
                      </Select.Trigger>
                      <Select.Content>
                        {availableLanguages.map((lang) => (
                          <Select.Item key={lang.value} value={lang.value}>
                            {lang.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Breadcrumb.Item>
                </>
              )}
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
