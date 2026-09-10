import { useEffect, useState } from 'react';
import { Button, Input, Label, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember, SelectSegment } from 'ui-modules';

const SEGMENT_CONTENT_TYPE = 'core:products.products';

type FilterConfig = {
  title: string;
  segmentIds: string[];
  userIds: string[];
};

type LegacyFilterConfig = FilterConfig & {
  segmentId?: string;
};

type Props = {
  config?: {
    _id?: string;
    filters?: LegacyFilterConfig[];
  };
  currentStageId?: string;
  save: (config: { _id?: string; filters: FilterConfig[] }) => Promise<boolean>;
  delete: (id: string) => Promise<void>;
};

const emptyFilter = (index: number): FilterConfig => ({
  title: `Filter ${index + 1}`,
  segmentIds: [],
  userIds: [],
});

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const DefaultFilterConfig: React.FC<Props> = ({
  config,
  currentStageId,
  save,
  delete: deleteConfig,
}) => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  useEffect(() => {
    const incoming = Array.isArray(config?.filters) ? config.filters : [];
    setFilters(
      incoming.map((f, i: number) => ({
        title: f?.title || `Filter ${i + 1}`,
        segmentIds: Array.isArray(f?.segmentIds)
          ? f.segmentIds
          : f?.segmentId
            ? [f.segmentId]
            : [],
        userIds: Array.isArray(f?.userIds) ? f.userIds : [],
      })),
    );
  }, [config]);

  const addFilter = () => {
    setFilters((prev) => [...prev, emptyFilter(prev.length)]);
  };

  const updateFilter = (
    index: number,
    field: keyof FilterConfig,
    value: FilterConfig[typeof field],
  ) => {
    setFilters((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await save({ _id: config?._id, filters });
      toast({
        title: t('success'),
        description: t('filter-configuration-saved'),
        variant: 'default',
      });
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: getErrorMessage(error, t('failed-to-save-filter')),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(t('delete-all-filter-confirm'))) return;

    if (!config?._id) {
      setFilters([]);
      return;
    }

    try {
      await deleteConfig(config._id);
      setFilters([]);
      toast({
        title: t('success'),
        description: t('filter-configuration-deleted'),
        variant: 'default',
      });
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: getErrorMessage(error, t('failed-to-delete-filter')),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {t('default-filter-configuration')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('configure-default-filters')}
            {currentStageId ? ` (Stage: ${currentStageId})` : ''}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button type="button" onClick={addFilter}>
            + {t('add-filter')}
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAll}
            >
              {t('delete-all')}
            </Button>

            <Button type="button" onClick={handleSave}>
              {t('save-all')}
            </Button>
          </div>
        </div>

        {filters.length === 0 ? (
          <div className="rounded-xl border p-10 text-center text-muted-foreground shadow-sm">
            {t('no-filter-configurations')}
          </div>
        ) : (
          <div className="space-y-6">
            {filters.map((filter, index) => (
              <div
                key={filter.title}
                className="rounded-xl border p-6 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">{filter.title}</h3>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(index)}
                  >
                    {t('remove')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('title')}</Label>
                    <Input
                      value={filter.title}
                      onChange={(e) =>
                        updateFilter(index, 'title', e.target.value)
                      }
                      placeholder={t('filter-title')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('segment')}
                    </Label>
                    <SelectSegment
                      contentType={SEGMENT_CONTENT_TYPE}
                      mode="multiple"
                      selected={filter.segmentIds}
                      onSelect={(segmentIds) =>
                        updateFilter(
                          index,
                          'segmentIds',
                          Array.isArray(segmentIds) ? segmentIds : [],
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {t('assigned-users')}
                  </Label>

                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <SelectMember
                        mode="multiple"
                        value={filter.userIds}
                        onValueChange={(userIds) =>
                          updateFilter(
                            index,
                            'userIds',
                            Array.isArray(userIds) ? userIds : [],
                          )
                        }
                        placeholder={t('choose-user')}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateFilter(index, 'userIds', [])}
                      disabled={(filter.userIds || []).length === 0}
                    >
                      {t('clear')}
                    </Button>
                  </div>

                  {!filter.userIds.length && (
                    <div className="text-sm text-muted-foreground">
                      {t('no-users-selected')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultFilterConfig;
