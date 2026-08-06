import React, { useState } from 'react';
import { useSavedWidgets } from '../../hooks/useSavedWidgets';
import { Card, Button } from 'erxes-ui';
import { SectionCard } from '../common/SectionCard';
import { WidgetEditor } from './WidgetEditor';

interface Props {
  onLoad: (widget: any) => void;
}

export const WidgetList: React.FC<Props> = ({ onLoad }) => {
  const { widgets, loading, saveWidget, updateWidget, deleteWidget } = useSavedWidgets();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any | null>(null);

  const handleSave = async (data: any) => {
    if (editingWidget) {
      await updateWidget(editingWidget._id, data);
    } else {
      await saveWidget(data);
    }
    setEditorOpen(false);
    setEditingWidget(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this widget?')) {
      await deleteWidget(id);
    }
  };

  if (loading) return <div className="text-center py-4">Loading widgets...</div>;

  return (
      <SectionCard
    title="Saved Widgets"
    loading={loading}
    skeletonHeight="h-64"
  >
    <div className="flex justify-end mb-4">
      <Button
        onClick={() => {
          setEditingWidget(null);
          setEditorOpen(true);
        }}
      >
        Add Widget
      </Button>
    </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget: any) => (
          <Card
            key={widget._id}
            className="cursor-pointer transition hover:shadow-lg"
          >
            <Card.Header className="flex justify-between items-start">
              <div>
                <Card.Title className="text-base">
                  {widget.name}
                </Card.Title>
                <p className="text-sm text-gray-500">
                  {widget.chartType}
                </p>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingWidget(widget);
                    setEditorOpen(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(widget._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card.Header>

            <Card.Content>
              <button
                className="w-full text-left text-sm text-blue-600 hover:underline"
                onClick={() => onLoad(widget)}
              >
                Load Widget
              </button>

              <div className="mt-1 text-xs text-gray-400">
                Filters: {JSON.stringify(widget.filters).slice(0, 40)}...
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <WidgetEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingWidget(null);
        }}
        onSave={handleSave}
        initialData={editingWidget}
      />
    </SectionCard>
  );
};
