import { useState, useMemo } from 'react';
import { Form, Button, Popover, Command } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { IAmenity } from '../../../amenities/types/amenity';

interface Props {
  field: { value?: string[]; onChange: (value: string[]) => void };
  availableAmenities: IAmenity[];
}

export const DayAmenitiesSelect = ({ field, availableAmenities }: Props) => {
  const [open, setOpen] = useState(false);

  const amenities = useMemo(
    () => availableAmenities || [],
    [availableAmenities],
  );

  const selectedIds = field.value || [];

  const handleToggle = (amenityId: string) => {
    const newValue = selectedIds.includes(amenityId)
      ? selectedIds.filter((id) => id !== amenityId)
      : [...selectedIds, amenityId];

    field.onChange(newValue);
  };

  return (
    <Form.Item>
      <Form.Label>Amenities</Form.Label>

      <Form.Control>
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full h-9 font-normal"
              type="button"
            >
              <span className="truncate">
                {selectedIds.length > 0
                  ? `${selectedIds.length} amenit${
                      selectedIds.length === 1 ? 'y' : 'ies'
                    } selected`
                  : 'Select amenities'}
              </span>
            </Button>
          </Popover.Trigger>

          <Popover.Content className="w-[320px] p-0" align="start">
            <Command>
              <Command.Input
                placeholder="Search amenities..."
                className="h-9"
              />

              <Command.Empty>No amenities found.</Command.Empty>

              <Command.Group className="max-h-[300px] overflow-auto">
                {amenities.map((amenity) => {
                  const isSelected = selectedIds.includes(amenity._id);

                  return (
                    <Command.Item
                      key={amenity._id}
                      value={`${amenity.name} ${amenity._id}`}
                      onSelect={() => handleToggle(amenity._id)}
                      className="px-2 h-8 cursor-pointer"
                    >
                      <div className="flex gap-2 items-center w-full">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-input bg-background'
                          }`}
                        >
                          {isSelected && (
                            <IconCheck
                              size={12}
                              className="text-primary-foreground"
                            />
                          )}
                        </div>

                        <span className="text-sm truncate">{amenity.name}</span>
                      </div>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command>
          </Popover.Content>
        </Popover>
      </Form.Control>
    </Form.Item>
  );
};
