import React from 'react';
import { Button } from 'erxes-ui';
import { Form } from 'erxes-ui';
import { Select } from 'erxes-ui';


type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerConditions = ({ condition, onChange, onRemove }: Props) => {
  const onChangeConfig = (code: string, value: any) => {
    onChange(condition.id, { ...condition, [code]: value });
  };

  return (
    <div className="rounded border p-4 space-y-4">
      {/* MAIN FORM */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <Form.Item>
            <Form.Label>Product Category</Form.Label>
            <Select
              value={condition.productCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('productCategoryIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose product category" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: map categories */}
              </Select.Content>
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Exclude categories</Form.Label>
            <Select
              value={condition.excludeCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('excludeCategoryIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose categories to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Product Tags</Form.Label>
            <Select
              value={condition.productTagIds}
              onValueChange={(v) =>
                onChangeConfig('productTagIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose product tags" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Exclude tags</Form.Label>
            <Select
              value={condition.excludeTagIds}
              onValueChange={(v) =>
                onChangeConfig('excludeTagIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose tags to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Exclude products</Form.Label>
            <Select
              value={condition.excludeProductIds}
              onValueChange={(v) =>
                onChangeConfig('excludeProductIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose products to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Segment</Form.Label>
            <Select
              value={condition.segments}
              onValueChange={(v) =>
                onChangeConfig('segments', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose segments" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <Form.Item>
            <Form.Label>Low Count</Form.Label>
            <Form.Control>
              <input
                type="number"
                value={condition.ltCount || ''}
                onChange={(e) =>
                  onChangeConfig('ltCount', e.target.value)
                }
              />
            </Form.Control>
          </Form.Item>

          <Form.Item>
            <Form.Label>Great Count</Form.Label>
            <Form.Control>
              <input
                type="number"
                value={condition.gtCount || ''}
                onChange={(e) =>
                  onChangeConfig('gtCount', e.target.value)
                }
              />
            </Form.Control>
          </Form.Item>

          <Form.Item>
            <Form.Label>Low UnitPrice</Form.Label>
            <Form.Control>
              <input
                type="number"
                value={condition.ltUnitPrice || ''}
                onChange={(e) =>
                  onChangeConfig('ltUnitPrice', e.target.value)
                }
              />
            </Form.Control>
          </Form.Item>

          <Form.Item>
            <Form.Label>Great UnitPrice</Form.Label>
            <Form.Control>
              <input
                type="number"
                value={condition.gtUnitPrice || ''}
                onChange={(e) =>
                  onChangeConfig('gtUnitPrice', e.target.value)
                }
              />
            </Form.Control>
          </Form.Item>

          <Form.Item>
            <Form.Label>Sub uom type</Form.Label>
            <Select
              value={condition.subUomType || ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select option" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">Not use</Select.Item>
                <Select.Item value="lt">Low than count</Select.Item>
                <Select.Item value="gte">
                  Greater, equal than count
                </Select.Item>
              </Select.Content>
            </Select>
          </Form.Item>
        </div>
      </div>

      {/* BRANCH & DEPARTMENT */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item>
            <Form.Label>Set branch</Form.Label>
            <Select
              value={condition.branchId || ''}
              onValueChange={(v) =>
                onChangeConfig('branchId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose branch" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Set department</Form.Label>
            <Select
              value={condition.departmentId || ''}
              onValueChange={(v) =>
                onChangeConfig('departmentId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose department" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </Form.Item>
        </div>
        </div>

      {/* DELETE */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(condition.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerConditions;
