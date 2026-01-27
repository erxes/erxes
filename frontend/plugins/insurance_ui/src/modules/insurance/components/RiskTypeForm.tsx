import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input } from 'erxes-ui';
import { useCreateRiskType, useUpdateRiskType } from '../hooks';
import { RiskType } from '../types';

interface RiskTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskType?: RiskType;
  onSuccess?: () => void;
}

export const RiskTypeForm = ({
  open,
  onOpenChange,
  riskType,
  onSuccess,
}: RiskTypeFormProps) => {
  const { createRiskType, loading: creating } = useCreateRiskType();
  const { updateRiskType, loading: updating } = useUpdateRiskType();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (riskType) {
      setFormData({
        name: riskType.name,
        description: riskType.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [riskType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (riskType) {
        await updateRiskType({
          variables: {
            id: riskType.id,
            name: formData.name,
            description: formData.description || undefined,
          },
        });
      } else {
        await createRiskType({
          variables: {
            name: formData.name,
            description: formData.description || undefined,
          },
        });
      }

      setFormData({ name: '', description: '' });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving risk type:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {riskType ? 'Edit Risk Type' : 'Create New Risk Type'}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Fire, Theft, Accident"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this risk type..."
            />
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating || updating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? 'Saving...'
                : riskType
                ? 'Update'
                : 'Create'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
