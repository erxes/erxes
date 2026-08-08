import React, { useState, useEffect } from 'react';
import { Button, Input } from 'erxes-ui';

const CHART_TYPES = [
  { value: 'DealsTotalCount', label: 'Total Deals' },
  { value: 'DealCountByTag', label: 'Deals by Tag' },
  { value: 'DealCountByLabel', label: 'Deals by Label' },
  { value: 'DealRevenueByStage', label: 'Revenue by Stage' },
  { value: 'DealAverageAmountByRep', label: 'Avg Amount by Rep' },
  { value: 'DealLeaderBoardAmountClosedByRep', label: 'Closed Leaderboard' },
  { value: 'DealsClosedLostByRep', label: 'Closed Lost by Rep' },
  { value: 'DealsClosedWonByRep', label: 'Closed Won by Rep' },
  { value: 'DealsTotalCountByDueDate', label: 'Due Date Grouping' },
  { value: 'DealAverageTimeSpentInEachStage', label: 'Avg Time in Stage' },
  { value: 'ClosedRevenueByMonthWithDealTotalAndClosedRevenueBreakdown', label: 'Closed Revenue by Month' },
  { value: 'DealCountByCustomer', label: 'Deals by Customer' },
  { value: 'DealCountByOpenProbability', label: 'Open Stages' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: any) => void;
  initialData?: any;
}

export const WidgetEditor: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [chartType, setChartType] = useState('');
  const [filters, setFilters] = useState('{}');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setChartType(initialData.chartType || '');
      setFilters(JSON.stringify(initialData.filters || {}, null, 2));
    } else {
      setName('');
      setChartType('');
      setFilters('{}');
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!name.trim() || !chartType) {
      alert('Name and Chart Type are required');
      return;
    }
    let parsedFilters;
    try {
      parsedFilters = JSON.parse(filters);
    } catch (e) {
      alert('Invalid JSON in filters field');
      return;
    }
    onSave({
      name: name.trim(),
      chartType,
      filters: parsedFilters,
      position: 0,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Widget' : 'Add Widget'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="My Widget"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Select chart type</option>
              {CHART_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Filters (JSON)</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm font-mono"
              rows={4}
              value={filters}
              onChange={(e) => setFilters(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
};