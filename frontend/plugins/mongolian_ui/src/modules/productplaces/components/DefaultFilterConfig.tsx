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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Default Filter Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure default product filters by segment (Stage: {currentStageId})
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button type="button" variant="default" onClick={addFilter}>
          + Add Filter
        </Button>

        <div className="space-x-2">
          <Button type="button" variant="destructive" onClick={handleDeleteAll}>
            Delete All
          </Button>
          <Button type="button" variant="default" onClick={handleSave}>
            Save All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {filters.map((filter, index) => (
          <div key={index} className="bg-white p-4 rounded border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{filter.title}</h3>

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <input
                  className="w-full p-2 border rounded"
                  value={filter.title}
                  onChange={(e) => updateFilter(index, 'title', e.target.value)}
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

            {/* Users (multi) */}
            <div className="space-y-2">
              <Label>Assigned Users</Label>

              {/* this SelectUsers is single-select, so we use it as "picker" and add to list */}
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <SelectUsers
                    value=""
                    onChange={(userId) => {
                      toggleUser(index, userId);
                    }}
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

              {/* selected users list */}
              {(filter.userIds || []).length === 0 ? (
                <div className="text-sm text-gray-400">No users selected</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filter.userIds.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 px-2 py-1 rounded border text-sm"
                    >
                      <span>{id}</span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-red-600"
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

        {filters.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No filter configurations. Click "Add Filter" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultFilterConfig;
