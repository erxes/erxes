import { useEffect, useState } from 'react';
import { Button, Input, Label, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import SelectSegments from '../selects/SelectSegments';
import SelectUsers from '../selects/SelectUsers';

const SEGMENT_CONTENT_TYPES = ['core:product.product'];

type FilterConfig = {
  title: string;
  segmentId: string;
  userIds: string[];
};

type Props = {
  config: any;
  currentStageId?: string;
  save: (config: any) => void;
  delete: () => void;
};

const emptyFilter = (index: number): FilterConfig => ({
  title: `Filter ${index + 1}`,
  segmentId: '',
  userIds: [],
});

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
      incoming.map((f: any, i: number) => ({
        title: f?.title || `Filter ${i + 1}`,
        segmentId: f?.segmentId || '',
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
    value: any,
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

  const toggleUser = (filterIndex: number, userId: string) => {
    if (!userId) return;

    setFilters((prev) => {
      const next = [...prev];
      const current = next[filterIndex];

      const exists = current.userIds.includes(userId);

      next[filterIndex] = {
        ...current,
        userIds: exists
          ? current.userIds.filter((id) => id !== userId)
          : [...current.userIds, userId],
      };

      return next;
    });
  };

  const handleSave = () => {
    try {
      save({ filters });
      toast({
        title: t('success'),
        description: t('filter-configuration-saved'),
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error?.message || t('failed-to-save-filter'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = () => {
    if (!window.confirm(t('delete-all-filter-confirm'))) return;
    try {
      deleteConfig();
      setFilters([]);
      toast({
        title: t('success'),
        description: t('filter-configuration-deleted'),
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error?.message || t('failed-to-delete-filter'),
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
          <div className="bg-white rounded-xl border p-10 text-center text-muted-foreground shadow-sm">
            {t('no-filter-configurations')}
          </div>
        ) : (
          <div className="space-y-6">
            {filters.map((filter, index) => (
              <div
                key={filter.title}
                className="bg-white rounded-xl border p-6 shadow-sm space-y-6"
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
                    <Label className="text-sm font-medium">{t('segment')}</Label>
                    <SelectSegments
                      contentTypes={SEGMENT_CONTENT_TYPES}
                      value={filter.segmentId}
                      onValueChange={(segmentId) =>
                        updateFilter(index, 'segmentId', segmentId || '')
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t('assigned-users')}</Label>

                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <SelectUsers
                        value=""
                        onChange={(userId) => toggleUser(index, userId)}
                        ids={[]}
                        excludeIds={false}
                        isAssignee={true}
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

                  {(filter.userIds || []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {t('no-users-selected')}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filter.userIds.map((id) => (
                        <div
                          key={id}
                          className="flex items-center gap-2 px-3 py-1 rounded-md border text-sm bg-muted/40"
                        >
                          <span className="truncate max-w-[160px]">{id}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-red-600"
                            onClick={() => toggleUser(index, id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
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
