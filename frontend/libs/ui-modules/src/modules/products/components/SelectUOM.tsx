import { Form, Select } from 'erxes-ui';
import { useUom } from '../hooks/useUom';
import React from 'react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

export const SelectUOM = ({
  value,
  onValueChange,
  inForm = false,
  disabledUoms = [],
}: {
  value: string;
  onValueChange: (value: string) => void;
  inForm?: boolean;
  disabledUoms?: string[];
}) => {
  const { uoms, loading } = useUom();
  const Controller = inForm ? Form.Control : React.Fragment;
  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <Controller>
        <Select.Trigger>
          <Select.Value placeholder="Choose UOM" />
        </Select.Trigger>
      </Controller>
      <Select.Content>
        {uoms.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center flex-col gap-2">
            No UOMs available
            <Button variant="secondary" size="sm" asChild>
              <Link to="/settings/products">Add UOM</Link>
            </Button>
          </div>
        ) : (
          uoms.map((uom) => (
            <Select.Item
              key={uom._id}
              value={uom._id}
              disabled={disabledUoms.includes(uom._id)}
            >
              {uom.name}
            </Select.Item>
          ))
        )}
      </Select.Content>
    </Select>
  );
};
