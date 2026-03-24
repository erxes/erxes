import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useCreateInsuranceType, useUpdateInsuranceType } from '../hooks';
import { InsuranceType, AttributeInput } from '../types';

interface InsuranceTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insuranceType?: InsuranceType;
  onSuccess?: () => void;
}

export const InsuranceTypeForm = ({
  open,
  onOpenChange,
  insuranceType,
  onSuccess,
}: InsuranceTypeFormProps) => {
  const { createInsuranceType, loading: creating } = useCreateInsuranceType();
  const { updateInsuranceType, loading: updating } = useUpdateInsuranceType();

  const [formData, setFormData] = useState({
    name: '',
    attributes: [] as AttributeInput[],
  });

  useEffect(() => {
    if (insuranceType) {
      setFormData({
        name: insuranceType.name,
        attributes: insuranceType.attributes || [],
      });
    } else {
      setFormData({
        name: '',
        attributes: [],
      });
    }
  }, [insuranceType, open]);

  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [
        ...formData.attributes,
        {
          name: '',
          dataType: 'string',
          required: false,
          description: '',
        },
      ],
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter((_, i) => i !== index),
    });
  };

  const handleAttributeChange = (
    index: number,
    field: keyof AttributeInput,
    value: any,
  ) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = {
      ...newAttributes[index],
      [field]: value,
    };
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Remove __typename from attributes (added by Apollo Client)
    const cleanAttributes = formData.attributes.map(
      ({ __typename, ...attr }: any) => attr,
    );

    try {
      if (insuranceType) {
        await updateInsuranceType({
          variables: {
            id: insuranceType.id,
            name: formData.name,
            attributes:
              cleanAttributes.length > 0 ? cleanAttributes : undefined,
          },
        });
      } else {
        await createInsuranceType({
          variables: {
            name: formData.name,
            attributes:
              cleanAttributes.length > 0 ? cleanAttributes : undefined,
          },
        });
      }

      setFormData({ name: '', attributes: [] });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving insurance type:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title>
            {insuranceType
              ? 'Edit Insurance Type'
              : 'Create New Insurance Type'}
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
              placeholder="e.g., Travel Insurance, Auto Insurance"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttribute}
              >
                <IconPlus size={16} />
                Add Attribute
              </Button>
            </div>

            {formData.attributes.map((attr, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Attribute {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttribute(index)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      value={attr.name}
                      onChange={(e) =>
                        handleAttributeChange(index, 'name', e.target.value)
                      }
                      placeholder="e.g., destination"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Data Type *</Label>
                    <select
                      className="w-full h-9 px-3 border rounded-md text-sm"
                      value={attr.dataType}
                      onChange={(e) =>
                        handleAttributeChange(index, 'dataType', e.target.value)
                      }
                      required
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={attr.description || ''}
                      onChange={(e) =>
                        handleAttributeChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      placeholder="Describe this attribute"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={attr.required}
                      onChange={(e) =>
                        handleAttributeChange(
                          index,
                          'required',
                          e.target.checked,
                        )
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`required-${index}`} className="text-xs">
                      Required
                    </Label>
                  </div>

                  {attr.dataType === 'number' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Min Value</Label>
                        <Input
                          type="number"
                          value={attr.min?.toString() || ''}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              'min',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          placeholder="Min"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Max Value</Label>
                        <Input
                          type="number"
                          value={attr.max?.toString() || ''}
                          onChange={(e) =>
                            handleAttributeChange(
                              index,
                              'max',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          placeholder="Max"
                        />
                      </div>
                    </>
                  )}

                  {attr.dataType === 'string' && (
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">
                        Options (comma-separated)
                      </Label>
                      <Input
                        value={attr.options?.join(', ') || ''}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            'options',
                            e.target.value
                              .split(',')
                              .map((o) => o.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="e.g., USA, Europe, Asia"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {formData.attributes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attributes defined. Click "Add Attribute" to create one.
              </p>
            )}
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
                : insuranceType
                ? 'Update'
                : 'Create'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
