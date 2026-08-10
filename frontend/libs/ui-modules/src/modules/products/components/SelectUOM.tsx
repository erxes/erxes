import { Button, Form, Select } from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { useUom } from '../hooks/useUom';

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
  const selectableUoms = uoms.filter(
    (uom) => (uom.code ?? '').trim().length > 0,
  );
  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <Controller>
        <Select.Trigger>
          <Select.Value placeholder="Choose UOM" />
        </Select.Trigger>
      </Controller>
      <Select.Content>
        {selectableUoms.length ? (
          selectableUoms.map((uom) => (
            <Select.Item
              key={uom._id}
              value={uom.code}
              disabled={disabledUoms.includes(uom.code)}
            >
              {uom.name}
            </Select.Item>
          ))
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center py-8 text-sm text-center text-muted-foreground">
            No UOMs available
            <Button variant="secondary" size="sm" asChild>
              <Link to="/settings/products">Add UOM</Link>
            </Button>
          </div>
        )}
      </Select.Content>
    </Select>
  );
};
