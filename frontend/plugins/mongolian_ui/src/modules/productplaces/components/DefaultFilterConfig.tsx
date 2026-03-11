import { useEffect, useState } from 'react';
import { Button, Label } from 'erxes-ui';
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
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  // sync from backend config
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
    save({ filters });
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete all filter configs?')) return;
    deleteConfig();
    setFilters([]);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-8">
        {/* HEADER */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            Default Filter Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure default product filters by segment
            {currentStageId ? ` (Stage: ${currentStageId})` : ''}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Button type="button" onClick={addFilter}>
            + Add Filter
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAll}
            >
              Delete All
            </Button>

            <Button type="button" onClick={handleSave}>
              Save All
            </Button>
          </div>
        </div>

        {/* FILTER LIST */}
        {filters.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center text-muted-foreground shadow-sm">
            No filter configurations. Click "Add Filter" to create one.
          </div>
        ) : (
          <div className="space-y-6">
            {filters.map((filter, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border p-6 shadow-sm space-y-6"
              >
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">{filter.title}</h3>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(index)}
                  >
                    Remove
                  </Button>
                </div>

                {/* Title + Segment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <input
                      className="w-full rounded-md border px-3 py-2"
                      value={filter.title}
                      onChange={(e) =>
                        updateFilter(index, 'title', e.target.value)
                      }
                      placeholder="Filter title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Segment</Label>
                    <SelectSegments
                      contentTypes={SEGMENT_CONTENT_TYPES}
                      value={filter.segmentId}
                      onChange={(segmentId) =>
                        updateFilter(index, 'segmentId', segmentId || '')
                      }
                    />
                  </div>
                </div>

                {/* Users */}
                <div className="space-y-3">
                  <Label>Assigned Users</Label>

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
                      Clear
                    </Button>
                  </div>

                  {(filter.userIds || []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No users selected
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