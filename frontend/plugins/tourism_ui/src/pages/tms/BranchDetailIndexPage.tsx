import { IconBox } from '@tabler/icons-react';
import { Breadcrumb, Button, Select, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useSearchParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { BranchDetailView } from '@/tms/branch-detail/components/BranchDetailView';
import { useBranchDetailPage } from '@/tms/branch-detail/hooks/useBranchDetailPage';
import { LANGUAGES } from '@/tms/constants/languages';

import { TourCreateSheet } from '@/tms/branch-detail/dashboard/tours/_components/TourCreateSheet';
import { ItineraryCreateSheet } from '@/tms/branch-detail/dashboard/itinerary';
import { ElementCreateSheet } from '@/tms/branch-detail/dashboard/elements';
import { AmenityCreateSheet } from '@/tms/branch-detail/dashboard/amenities';
import { CategoryCreateSheet } from '@/tms/branch-detail/dashboard/category';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

type ActiveTab = 'tour' | 'category' | 'itinerary' | 'elements' | 'amenities';

const VALID_TABS = new Set<ActiveTab>([
  'tour',
  'category',
  'itinerary',
  'elements',
  'amenities',
]);

const CREATE_SHEET_MAP: Record<ActiveTab, (branchId: string) => JSX.Element> = {
  tour: (branchId) => <TourCreateSheet branchId={branchId} />,
  category: (branchId) => <CategoryCreateSheet branchId={branchId} />,
  itinerary: (branchId) => <ItineraryCreateSheet branchId={branchId} />,
  elements: (branchId) => <ElementCreateSheet branchId={branchId} />,
  amenities: (branchId) => <AmenityCreateSheet branchId={branchId} />,
};

export const BranchDetailIndexPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const activeLanguage =
    searchParams.get('lang') || selectedBranch?.language || availableLanguages[0]?.value || '';

  const setActiveLang = useSetAtom(activeLangAtom);

  useEffect(() => {
    setActiveLang(activeLanguage);
  }, [activeLanguage, setActiveLang]);

  useEffect(() => {
    if (!branchId) return;

    const defaultLang = selectedBranch?.language || availableLanguages[0]?.value;
    if (!searchParams.get('lang')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (defaultLang) next.set('lang', defaultLang);
        return next;
      });
      setActiveLang(defaultLang || '');
    }
  }, [branchId, selectedBranch?.language, availableLanguages, searchParams, setSearchParams, setActiveLang]);

  const onSelectLanguage = (lang: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('lang', lang);
      return next;
    });

    setActiveLang(lang);
  };

  const renderCreateSheet = () => {
    if (!branchId) return null;
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

              <Breadcrumb.Separator />

              <Breadcrumb.Item>
                {availableLanguages.length > 0 ? (
                  <Select value={activeLanguage} onValueChange={onSelectLanguage}>
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
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No languages available
                  </span>
                )}
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