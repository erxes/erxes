import {
  Control,
  FieldPath,
  FieldPathByValue,
  useFieldArray,
} from 'react-hook-form';
import {
  Form,
  Input,
  Select,
  Switch,
  Editor,
  Upload,
  readImage,
  Button,
  Textarea,
  Label,
  Badge,
} from 'erxes-ui';
import { TourFormValues } from '../constants/formSchema';
import {
  IconPlus,
  IconTrash,
  IconUpload,
  IconFileText,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { SelectItinerary } from '../../itinerary/_components/SelectItinerary';
import { ImageUploadGrid } from '../../../components';
import { SelectTourCategory } from './SelectTourCategory';
import { toOptionalString, toOptionalNumber } from '../utils/fieldConverters';
import { LANGUAGES } from '@/tms/constants/languages';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';

type TourTextFieldPath = FieldPathByValue<TourFormValues, string | undefined>;

interface TourTextFieldProps {
  control: Control<TourFormValues>;
  name?: TourTextFieldPath;
  labelSuffix?: string;
}

export const TourNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: TourTextFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
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
  name = 'refNumber',
  labelSuffix = '',
}: TourTextFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Ref Number<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
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
  control: Control<TourFormValues>;
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
  name = 'content',
  labelSuffix = '',
}: TourTextFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Content<span className="text-primary">{labelSuffix}</span>{' '}
          </Form.Label>
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

export const TourDurationField = ({
  control,
}: {
  control: Control<TourFormValues>;
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
  control: Control<TourFormValues>;
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

export const TourInfo1Field = ({
  control,
  name = 'info1',
}: Omit<TourTextFieldProps, 'labelSuffix'>) => {
  return (
    <Form.Field
      control={control}
      name={name}
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
  name = 'info2',
}: Omit<TourTextFieldProps, 'labelSuffix'>) => {
  return (
    <Form.Field
      control={control}
      name={name}
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
  name = 'info3',
}: Omit<TourTextFieldProps, 'labelSuffix'>) => {
  return (
    <Form.Field
      control={control}
      name={name}
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
  name = 'info4',
}: Omit<TourTextFieldProps, 'labelSuffix'>) => {
  return (
    <Form.Field
      control={control}
      name={name}
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
  name = 'info5',
}: Omit<TourTextFieldProps, 'labelSuffix'>) => {
  return (
    <Form.Field
      control={control}
      name={name}
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
  control: Control<TourFormValues>;
}) => {
  return (
    <Form.Field
      control={control}
      name="advanceCheck"
      render={({ field }) => (
        <Form.Item className="flex items-center gap-2">
          <Form.Control>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Form.Control>

          <Form.Label className="cursor-pointer">Advance Check</Form.Label>

          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
export const TourAdvancePercentField = ({
  control,
}: {
  control: Control<TourFormValues>;
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
  control: Control<TourFormValues>;
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
  language,
}: {
  control: Control<TourFormValues>;
  branchId?: string;
  language?: string;
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
              language={language}
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
  branchId,
  language,
}: {
  control: Control<TourFormValues>;
  branchId?: string;
  language?: string;
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
              branchId={branchId}
              language={language}
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
  control: Control<TourFormValues>;
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
                  <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
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
                  <div className="absolute inset-0 flex items-center justify-center transition bg-black/0 group-hover:bg-black/30">
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
                  className="absolute shadow opacity-0 top-2 right-2 group-hover:opacity-100"
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
  control: Control<TourFormValues>;
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

export const TourAttachmentsField = ({
  control,
}: {
  control: Control<TourFormValues>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      control={control}
      name="attachment"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Attachment (PDF)</Form.Label>

          <Form.Control>
            <Upload.Root
              value={field.value?.url || ''}
              onChange={(fileInfo: any) => {
                if (!fileInfo || fileInfo === '') {
                  field.onChange(null);
                } else if (typeof fileInfo === 'object' && 'url' in fileInfo) {
                  field.onChange({
                    url: fileInfo.url,
                    name: fileInfo.name || '',
                    type: fileInfo.type || '',
                    size: fileInfo.size || 0,
                  });
                }
              }}
              className="relative group"
            >
              <Upload.Button
                size="sm"
                type="button"
                variant="secondary"
                className="overflow-hidden relative w-full min-h-[94px] rounded-md border border-dashed transition aspect-video bg-background hover:bg-accent"
              >
                {!field.value ? (
                  <div className="flex items-center justify-center w-full gap-2 text-sm text-muted-foreground">
                    {isLoading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <IconUpload size={18} />
                        <span>Upload PDF</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center w-full gap-2 px-1">
                    <IconFileText
                      size={18}
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="text-sm truncate">{field.value.name}</span>
                  </div>
                )}
              </Upload.Button>

              {field.value && (
                <Upload.RemoveButton
                  size="sm"
                  variant="destructive"
                  className="absolute -translate-y-1/2 shadow opacity-0 right-2 top-1/2 group-hover:opacity-100"
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

export { TourDateSchedulingField } from './TourDateSchedulingField';

const TourPricingOptionsFieldContent = ({
  control,
  translationIndex,
  labelSuffix = '',
  currencySymbol,
}: {
  control: Control<any>;
  translationIndex?: number;
  labelSuffix?: string;
  currencySymbol?: string;
}) => {
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  const isTranslation = translationIndex !== undefined && translationIndex >= 0;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pricingOptions',
  });

  const handleAdd = () => {
    append({
      _id: nanoid(8),
      title: '',
      minPersons: '',
      maxPersons: '',
      adultPrice: '',
      childPrice: '',
      infantPrice: '',
      accommodationType: '',
      domesticFlightPerPerson: '',
      singleSupplement: '',
      note: '',
    });
  };

  const handleRemove = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getFieldName = (index: number, field: string) => {
    if (isTranslation) {
      return `translations.${translationIndex}.pricingOptions.${index}.${field}` as FieldPath<TourFormValues>;
    }
    return `pricingOptions.${index}.${field}` as FieldPath<TourFormValues>;
  };

  return (
    <Form.Item className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Form.Label>Pricing Options</Form.Label>
          <Form.Description>
            Define packages, group sizes and pricing
          </Form.Description>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
            <IconPlus size={16} />
            Add Pricing Option
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 space-y-3 border rounded-lg bg-card"
          >
            <div className="flex items-start justify-between">
              <Label className="flex items-center gap-2">
                Package:
                <Badge variant="secondary" className="px-2 py-0.5 font-medium">
                  {index + 1}
                </Badge>
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                aria-label={`Remove pricing option ${index + 1}`}
              >
                <IconTrash size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={control}
                name={getFieldName(index, 'title')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Package Title
                      <span className="text-primary">{labelSuffix}</span>{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="e.g., Standard - Solo, Standard - Group"
                    />
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <Form.Field
                  control={control}
                  name={`pricingOptions.${index}.minPersons`}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Form.Label
                        className={fieldState.error ? 'text-destructive' : ''}
                      >
                        Min Persons <span className="text-destructive">*</span>
                      </Form.Label>
                      <Input type="number" min="1" {...field} placeholder="1" />
                      <Form.Message>{fieldState.error?.message}</Form.Message>
                    </div>
                  )}
                />

                <Form.Field
                  control={control}
                  name={`pricingOptions.${index}.maxPersons`}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Form.Label
                        className={fieldState.error ? 'text-destructive' : ''}
                      >
                        Max Persons
                      </Form.Label>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="Leave empty for unlimited"
                      />
                      <Form.Message>{fieldState.error?.message}</Form.Message>
                    </div>
                  )}
                />
              </div>
            </div>

            <Form.Field
              control={control}
              name={getFieldName(index, 'accommodationType')}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Form.Label
                    className={fieldState.error ? 'text-destructive' : ''}
                  >
                    Accommodation Type
                    <span className="text-primary">{labelSuffix}</span>
                  </Form.Label>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(toOptionalString(e.target.value))
                    }
                    placeholder="e.g., Hotel, Resort, etc."
                  />
                  <Form.Message>{fieldState.error?.message}</Form.Message>
                </div>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <Form.Field
                control={control}
                name={getFieldName(index, 'adultPrice')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Adult Price
                      <span className="text-primary">{labelSuffix}</span>{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {symbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />

              <Form.Field
                control={control}
                name={getFieldName(index, 'childPrice')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Child Price
                      <span className="text-primary">{labelSuffix}</span>
                    </Form.Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {symbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="Optional"
                        className="pl-7"
                      />
                    </div>
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />

              <Form.Field
                control={control}
                name={getFieldName(index, 'infantPrice')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Infant Price
                      <span className="text-primary">{labelSuffix}</span>
                    </Form.Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {symbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="Optional"
                        className="pl-7"
                      />
                    </div>
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={control}
                name={getFieldName(index, 'domesticFlightPerPerson')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Domestic Flight
                    </Form.Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {symbol}
                      </span>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />

              <Form.Field
                control={control}
                name={getFieldName(index, 'singleSupplement')}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Single Supplement
                    </Form.Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        {symbol}
                      </span>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(toOptionalNumber(e.target.value))
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />
            </div>

            <Form.Field
              control={control}
              name={getFieldName(index, 'note')}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Form.Label
                    className={fieldState.error ? 'text-destructive' : ''}
                  >
                    Note<span className="text-primary">{labelSuffix}</span>
                  </Form.Label>
                  <Textarea
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(toOptionalString(e.target.value))
                    }
                    placeholder="Additional information..."
                  />
                  <Form.Message>{fieldState.error?.message}</Form.Message>
                </div>
              )}
            />
          </div>
        ))}
      </div>
    </Form.Item>
  );
};

export const TourPricingOptionsField = ({
  control,
  translationIndex,
  labelSuffix,
  currencySymbol,
}: {
  control: Control<TourFormValues>;
  translationIndex?: number;
  labelSuffix?: string;
  currencySymbol?: string;
}) => {
  return (
    <TourPricingOptionsFieldContent
      control={control}
      translationIndex={translationIndex}
      labelSuffix={labelSuffix}
      currencySymbol={currencySymbol}
    />
  );
};
