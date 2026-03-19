import { Control } from 'react-hook-form';
import {
  Form,
  Input,
  Select,
  Switch,
  Editor,
  Upload,
  readImage,
  DatePicker,
  Button,
} from 'erxes-ui';
import { TourCreateFormType } from '../constants/formSchema';
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useState, useEffect } from 'react';
import { SelectItinerary } from '../../itinerary/_components/SelectItinerary';
import { ImageUploadGrid } from '../../../components';
import { SelectTourCategory } from './SelectTourCategory';

export const TourNameField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Tour name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourRefNumberField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="refNumber"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Ref Number <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Ref number" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const TOUR_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const TourStatusField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="status"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Status <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Select onValueChange={field.onChange} value={field.value}>
              <Select.Trigger
                className={!field.value ? 'text-muted-foreground' : ''}
              >
                {field.value
                  ? TOUR_STATUS_OPTIONS.find((opt) => opt.value === field.value)
                      ?.label
                  : 'Select status'}
              </Select.Trigger>
              <Select.Content>
                {TOUR_STATUS_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourDescriptionField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="content"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Content</Form.Label>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourCostField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="cost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Cost</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourDurationField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="duration"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Duration (days)</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="1" {...field} disabled />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourGroupSizeField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="groupSize"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Group Size</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

type PersonCostEntry = {
  id: string;
  range: string;
  price: string;
};

const createPersonCostEntry = (
  range = '',
  price: string | number = '',
): PersonCostEntry => ({
  id: nanoid(),
  range,
  price: price === '' ? '' : String(price),
});

const personCostToEntries = (
  value?: TourCreateFormType['personCost'],
): PersonCostEntry[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [createPersonCostEntry()];
  }

  const entries = Object.entries(value).map(([range, price]) =>
    createPersonCostEntry(range, price as string | number),
  );

  return entries.length > 0 ? entries : [createPersonCostEntry()];
};

const personCostEntriesToRecord = (entries: PersonCostEntry[]) =>
  entries.reduce<Record<string, number>>((acc, entry) => {
    const range = entry.range.trim();
    const price = Number(entry.price);

    if (!range || Number.isNaN(price)) {
      return acc;
    }

    acc[range] = price;

    return acc;
  }, {});

const TourPersonCostFieldContent = ({
  value,
  onChange,
}: {
  value?: TourCreateFormType['personCost'];
  onChange: (value: Record<string, number>) => void;
}) => {
  const [entries, setEntries] = useState<PersonCostEntry[]>(() =>
    personCostToEntries(value),
  );

  useEffect(() => {
    const normalizedValue = personCostEntriesToRecord(entries);
    const currentSerialized = JSON.stringify(normalizedValue);
    const incomingSerialized = JSON.stringify(value ?? {});

    if (currentSerialized === incomingSerialized) {
      return;
    }

    setEntries(personCostToEntries(value));
  }, [entries, value]);

  const handleChange = (
    index: number,
    key: 'range' | 'price',
    nextValue: string,
  ) => {
    const nextEntries = entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: nextValue } : entry,
    );

    setEntries(nextEntries);
    onChange(personCostEntriesToRecord(nextEntries));
  };

  const handleAdd = () => {
    setEntries((prev) => [...prev, createPersonCostEntry()]);
  };

  const handleRemove = (index: number) => {
    const nextEntries = entries.filter((_, entryIndex) => entryIndex !== index);
    const normalizedNextEntries = nextEntries.length
      ? nextEntries
      : [createPersonCostEntry()];

    setEntries(normalizedNextEntries);
    onChange(personCostEntriesToRecord(normalizedNextEntries));
  };

  return (
    <Form.Item className="space-y-4">
      <div className="flex justify-between items-center">
        <Form.Label>Person Cost</Form.Label>
        <Button type="button" variant="outline" onClick={handleAdd}>
          <IconPlus />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4"
          >
            <div className="space-y-2">
              <Form.Label>Persons Count</Form.Label>
              <Input
                value={entry.range}
                onChange={(event) =>
                  handleChange(index, 'range', event.target.value)
                }
                placeholder="2-3 / 4-5 / 6+"
              />
            </div>

            <div className="space-y-2">
              <Form.Label>Price per Person</Form.Label>
              <Input
                type="number"
                min="0"
                value={entry.price}
                onChange={(event) =>
                  handleChange(index, 'price', event.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={
                  entries.length === 1 &&
                  !entry.range &&
                  (entry.price === '' || entry.price === '0')
                }
              >
                <IconTrash size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Form.Message className="text-destructive" />
    </Form.Item>
  );
};

export const TourPersonCostField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="personCost"
      render={({ field }) => (
        <TourPersonCostFieldContent
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
};

export const TourStartDateField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="startDate"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Start Date</Form.Label>
          <Form.Control>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              defaultMonth={
                Array.isArray(field.value) ? field.value[0] : field.value
              }
              mode="multiple"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourEndDateField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="endDate"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>End Date (Auto-calculated)</Form.Label>
          <Form.Control>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              defaultMonth={field.value}
              mode="single"
              disabled
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourInfo1Field = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="info1"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourInfo2Field = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="info2"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourInfo3Field = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="info3"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourInfo4Field = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="info4"
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourInfo5Field = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="info5"
      render={({ field }) => (
        <Form.Item>
          <Form.Description>
            Not visible for clients and agents
          </Form.Description>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              isHTML
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourAdvanceCheckField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="advanceCheck"
      render={({ field }) => (
        <Form.Item className="flex gap-2 items-center">
          <Form.Control>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Form.Control>
          <Form.Label className="mt-0!">Advance Check</Form.Label>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourAdvancePercentField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="advancePercent"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Advance Percent</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" min="0" max="100" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourJoinPercentField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="joinPercent"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Join Percent</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" min="0" max="100" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourItineraryIdField = ({
  control,
  branchId,
}: {
  control: Control<TourCreateFormType>;
  branchId?: string;
}) => {
  return (
    <Form.Field
      control={control}
      name="itineraryId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Itinerary <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <SelectItinerary
              value={field.value}
              onValueChange={field.onChange}
              branchId={branchId}
              placeholder="Select itinerary"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourCategoryField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="categoryIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Categories</Form.Label>
          <Form.Control>
            <SelectTourCategory
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select categories"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourImageThumbnailField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      control={control}
      name="imageThumbnail"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Thumbnail Image</Form.Label>

          <Form.Control>
            <Upload.Root
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(fileInfo) => {
                if (typeof fileInfo === 'string') {
                  field.onChange(fileInfo);
                } else if (fileInfo && 'url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
              className="relative group"
            >
              <Upload.Button
                size="sm"
                type="button"
                variant="secondary"
                className="overflow-hidden relative w-full min-h-[94px] rounded-md border border-dashed transition aspect-video bg-background hover:bg-accent"
                style={
                  typeof field.value === 'string' && field.value
                    ? {
                        backgroundImage: `url(${readImage(field.value)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}
                }
              >
                {!field.value && (
                  <div className="flex flex-col gap-2 justify-center items-center text-sm text-muted-foreground">
                    {isLoading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <IconUpload size={22} />
                        <span>Upload thumbnail</span>
                      </>
                    )}
                  </div>
                )}

                {field.value && (
                  <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
                    <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 bg-black/70">
                      Change image
                    </span>
                  </div>
                )}
              </Upload.Button>

              {field.value && (
                <Upload.RemoveButton
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 shadow opacity-0 group-hover:opacity-100"
                >
                  <IconTrash size={14} />
                </Upload.RemoveButton>
              )}

              <div className="hidden">
                <Upload.Preview
                  onUploadStart={() => setIsLoading(true)}
                  onAllUploadsComplete={() => setIsLoading(false)}
                />
              </div>
            </Upload.Root>
          </Form.Control>

          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const MAX_IMAGES = 10;

export const TourImagesField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="images"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Tour Images</Form.Label>

          <Form.Control>
            <ImageUploadGrid
              value={field.value}
              onChange={field.onChange}
              maxImages={MAX_IMAGES}
              maxFileSize={20 * 1024 * 1024}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
