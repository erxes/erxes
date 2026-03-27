import { Control, useFieldArray } from 'react-hook-form';
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
} from 'erxes-ui';
import { TourCreateFormType } from '../constants/formSchema';
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { SelectItinerary } from '../../itinerary/_components/SelectItinerary';
import { ImageUploadGrid } from '../../../components';
import { SelectTourCategory } from './SelectTourCategory';
import { toOptionalString, toOptionalNumber } from '../utils/fieldConverters';

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

export { TourDateSchedulingField } from './TourDateSchedulingField';

const TourPricingOptionsFieldContent = ({
  control,
}: {
  control: Control<any>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pricingOptions',
  });

  const handleAdd = () => {
    append({
      title: '',
      minPersons: '',
      maxPersons: '',
      pricePerPerson: '',
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

  return (
    <Form.Item className="space-y-4">
      <div className="flex justify-between items-center">
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
            className="p-4 space-y-3 rounded-lg border bg-card"
          >
            <div className="flex justify-between items-start">
              <Label>
                Package: <Label className="text-black">{index + 1}</Label>
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
                name={`pricingOptions.${index}.title`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Package Title <span className="text-destructive">*</span>
                    </Form.Label>
                    <Input
                      {...field}
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

            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={control}
                name={`pricingOptions.${index}.accommodationType`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Accommodation Type
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

              <Form.Field
                control={control}
                name={`pricingOptions.${index}.pricePerPerson`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Price per Person{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...field}
                      placeholder="0.00"
                    />
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={control}
                name={`pricingOptions.${index}.domesticFlightPerPerson`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Domestic Flight
                    </Form.Label>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(toOptionalNumber(e.target.value))
                      }
                      placeholder="0.00"
                    />
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />

              <Form.Field
                control={control}
                name={`pricingOptions.${index}.singleSupplement`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Form.Label
                      className={fieldState.error ? 'text-destructive' : ''}
                    >
                      Single Supplement
                    </Form.Label>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(toOptionalNumber(e.target.value))
                      }
                      placeholder="0.00"
                    />
                    <Form.Message>{fieldState.error?.message}</Form.Message>
                  </div>
                )}
              />
            </div>

            <Form.Field
              control={control}
              name={`pricingOptions.${index}.note`}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Form.Label
                    className={fieldState.error ? 'text-destructive' : ''}
                  >
                    Note
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
}: {
  control: Control<TourCreateFormType>;
}) => {
  return <TourPricingOptionsFieldContent control={control} />;
};
