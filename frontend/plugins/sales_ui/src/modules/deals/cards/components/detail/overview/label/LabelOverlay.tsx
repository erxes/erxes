import { Button, Input, Spinner, cn, useQueryState } from 'erxes-ui';
import { IconCheck, IconPencil, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import {
  usePipelineLabelLabel,
  usePipelineLabels,
} from '@/deals/pipelines/hooks/usePipelineDetails';

import { IPipelineLabel } from '@/deals/types/pipelines';
import LabelForm from './LabelForm';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';

const LabelOverlay = ({ labels }: { labels: IPipelineLabel[] }) => {
  const [pipelineId] = useQueryState('pipelineId');
  const [targetId] = useAtom(dealDetailSheetState);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editLabelId, setEditLabelId] = useState<string | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    labels.map((label) => label._id || ''),
  );

  const { pipelineLabels = [], loading: labelsLoading } = usePipelineLabels({
    variables: { pipelineId },
  });

  const { labelPipelineLabel } = usePipelineLabelLabel();

  const filteredLabels = useMemo(() => {
    return pipelineLabels.filter((label) =>
      label.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [pipelineLabels, search]);

  const toggleLabel = (labelId: string) => {
    const newLabelIds = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter((id) => id !== labelId)
      : [...selectedLabelIds, labelId];

    setSelectedLabelIds(newLabelIds);

    labelPipelineLabel({
      variables: {
        targetId,
        labelIds: newLabelIds,
      },
    });
  };

  if (showForm) {
    return (
      <>
        <div className="flex items-center justify-between pb-2 border-b">
          <button
            onClick={() => setShowForm(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Back
          </button>
          <h3 className="text-sm font-semibold text-gray-600">
            {editLabelId ? 'Edit Label' : 'Add Label'}
          </h3>
          <span />
        </div>
        <LabelForm
          onSuccess={() => {
            setShowForm(false);
            setEditLabelId(null);
          }}
          labelId={editLabelId}
        />
      </>
    );
  }

  return (
    <>
      <h3 className="text-sm font-semibold text-gray-600 border-b pb-2">
        Labels
      </h3>
      <div className="flex-auto overflow-hidden py-2">
        <div className="space-y-4">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search labels"
            className="w-full border px-3 py-2 rounded-md"
          />

          {labelsLoading ? (
            <div className="flex justify-center items-center h-48">
              <Spinner />
            </div>
          ) : (
            <ul className="space-y-2 max-h-[200px] overflow-y-scroll">
              {filteredLabels.map((label) => (
                <li
                  key={label._id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-md border cursor-pointer',
                    'border-gray-200 hover:bg-gray-50',
                    selectedLabelIds.includes(label._id || '')
                      ? 'bg-blue-50 border-blue-300'
                      : '',
                  )}
                  onClick={() => toggleLabel(label._id || '')}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.colorCode }}
                    />
                    <span className="text-sm">{label.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedLabelIds.includes(label._id || '') && (
                      <IconCheck className="w-4 h-4 text-green-600" />
                    )}
                    <IconPencil
                      size={14}
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditLabelId(label._id || '');
                        setShowForm(true);
                      }}
                    />
                  </div>
                </li>
              ))}
              {filteredLabels.length === 0 && (
                <li className="text-sm text-gray-400">
                  No matching labels found
                </li>
              )}
            </ul>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setEditLabelId(null);
              setShowForm(true);
            }}
          >
            <IconPlus size={16} />
            Create a new label
          </Button>
        </div>
      </div>
    </>
  );
};

export default LabelOverlay;
