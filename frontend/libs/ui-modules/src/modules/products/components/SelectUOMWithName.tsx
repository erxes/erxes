import { Button, Form, Select, Input, toast } from 'erxes-ui';
import React, { useState } from 'react';
import { useUom } from '../hooks/useUom';
import { useMutation } from '@apollo/client';
import { UOMS_ADD } from '../graphql/mutations/uomMutations';
import { UOM_QUERY } from '../graphql/queries/productsQueries';
import { IconPlus } from '@tabler/icons-react';

function normalizeUomCode(name: string): string {
  const normalized = name.trim().toUpperCase();
  const replaced = (normalized as any).replaceAll?.(/\s+/g, '_');
  return replaced ?? normalized.replace(/\s+/g, '_');
}

interface SelectUOMWithNameProps {
  value: string;
  onValueChange: (value: string) => void;
  inForm?: boolean;
  disabledUoms?: string[];
}

export const SelectUOMWithName = ({
  value,
  onValueChange,
  inForm = false,
  disabledUoms = [],
}: SelectUOMWithNameProps) => {
  const { uoms, loading } = useUom();
  const [isCreating, setIsCreating] = useState(false);
  const [newUomName, setNewUomName] = useState('');
  const [uomsAdd, { loading: addingUom }] = useMutation(UOMS_ADD, {
    refetchQueries: [{ query: UOM_QUERY }],
  });

  const handleCreateUom = async () => {
    if (!newUomName.trim()) {
      toast({
        title: 'Error',
        description: 'UOM name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data } = await uomsAdd({
        variables: {
          name: newUomName.trim(),
          code: normalizeUomCode(newUomName),
        },
      });

      if (data?.uomsAdd) {
        onValueChange(data.uomsAdd._id);
        setNewUomName('');
        setIsCreating(false);
        toast({
          title: 'Success',
          description: 'UOM created successfully',
          variant: 'success',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create UOM',
        variant: 'destructive',
      });
    }
  };

  const Controller = inForm ? Form.Control : React.Fragment;
  const selectedUom = uoms.find((uom) => uom._id === value);

  const displayValue =
    selectedUom?.name || (value && !loading ? value : 'Choose UOM');

  if (isCreating) {
    return (
      <div className="flex gap-2">
        <Input
          placeholder="Enter UOM name"
          value={newUomName}
          onChange={(e) => setNewUomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreateUom();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setIsCreating(false);
              setNewUomName('');
            }
          }}
          disabled={addingUom}
          autoFocus
        />
        <Button
          type="button"
          className="h-8"
          onClick={handleCreateUom}
          disabled={addingUom || !newUomName.trim()}
        >
          {addingUom ? 'Creating...' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8"
          onClick={() => {
            setIsCreating(false);
            setNewUomName('');
          }}
          disabled={addingUom}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onValueChange} disabled={loading}>
          <Controller>
            <Select.Trigger>
              <Select.Value placeholder="Choose UOM">
                {displayValue}
              </Select.Value>
            </Select.Trigger>
          </Controller>
          <Select.Content>
            {uoms.length === 0 ? (
              <div className="flex flex-col gap-2 justify-center items-center py-8 text-sm text-center text-muted-foreground">
                No UOMs available
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
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-8"
        onClick={() => setIsCreating(true)}
        disabled={loading}
      >
        <IconPlus />
      </Button>
    </div>
  );
};
