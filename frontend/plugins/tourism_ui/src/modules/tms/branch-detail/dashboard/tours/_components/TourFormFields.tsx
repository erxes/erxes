import { Control } from 'react-hook-form';
import {
  Form,
  Input,
  Select,
  Switch,
  Editor,
  Upload,
  readImage,
  useErxesUpload,
  Button,
  DatePicker,
} from 'erxes-ui';
import { TourCreateFormType } from '../constants/formSchema';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

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
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
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
            <Input type="number" placeholder="1" {...field} />
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
              defaultMonth={field.value}
              mode="single"
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
          <Form.Label>End Date</Form.Label>
          <Form.Control>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              defaultMonth={field.value}
              mode="single"
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
          <Form.Label>Info 1</Form.Label>
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
          <Form.Label>Info 2</Form.Label>
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
          <Form.Label>Info 3</Form.Label>
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
          <Form.Label>Info 4</Form.Label>
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
          <Form.Label>Info 5</Form.Label>
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
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="itineraryId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Itinerary ID <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Itinerary ID" {...field} />
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
              {isLoading ? (
                <div className="flex flex-col justify-center items-center w-full h-32 rounded-md border border-dashed">
                  <div className="text-sm text-muted-foreground">
                    Uploading...
                  </div>
                </div>
              ) : (
                <>
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="flex overflow-hidden relative flex-col justify-center items-center w-full h-32 rounded-md border border-dashed text-muted-foreground group bg-background hover:bg-accent"
                    style={
                      typeof field.value === 'string' && field.value
                        ? {
                            backgroundImage: `url(${readImage(field.value)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }
                        : {}
                    }
                  >
                    {!field.value && (
                      <div className="flex relative z-10 flex-col gap-2 justify-center items-center">
                        <IconUpload size={20} />
                        <span className="text-xs">Upload thumbnail</span>
                      </div>
                    )}

                    {field.value && (
                      <div className="flex absolute inset-0 justify-center items-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div className="px-2 py-1 text-xs font-medium text-black rounded-lg backdrop-blur-sm bg-white/90">
                            Change
                          </div>
                        </div>
                      </div>
                    )}
                  </Upload.Button>
                  {field.value && (
                    <Upload.RemoveButton
                      size="sm"
                      variant="destructive"
                      className="absolute top-0 right-0 z-30 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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
                </>
              )}
            </Upload.Root>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const TourImagesFieldContent = ({
  field,
}: {
  field: {
    value?: string[];
    onChange: (value: string[]) => void;
  };
}) => {
  const urls = field.value || [];

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      const existing = urls || [];
      const addedUrls = (addedFiles || [])
        .map((file: any) => file.url)
        .filter(Boolean);
      const next = Array.from(new Set([...existing, ...addedUrls])).slice(
        0,
        50,
      );
      field.onChange(next);
    },
  });

  const { files, loading, onUpload } = uploadProps;

  useEffect(() => {
    if (files.length > 0 && !loading) {
      onUpload();
    }
  }, [files.length, loading, onUpload]);

  const handleRemove = (url: string) => {
    const next = (urls || []).filter((u: string) => u !== url);
    field.onChange(next);
  };

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="relative">
          <div className="flex flex-wrap gap-4">
            {urls.map((url: string) => (
              <div
                key={url}
                className="overflow-hidden relative w-24 rounded-md border aspect-square shadow-xs bg-muted group"
              >
                <img
                  src={readImage(url)}
                  alt=""
                  className="object-cover w-full h-full"
                />
                <button
                  className="inline-flex absolute top-0 right-0 z-30 justify-center items-center p-1 rounded-md shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                  type="button"
                  onClick={() => handleRemove(url)}
                >
                  <IconTrash size={14} />
                </button>
              </div>
            ))}
          </div>
          {uploadProps.loading && (
            <div className="flex absolute inset-0 justify-center items-center border bg-background">
              <div className="text-sm text-muted-foreground">Uploading...</div>
            </div>
          )}
        </div>
      )}
      <div>
        <input {...uploadProps.getInputProps()} />
        <Button
          variant="outline"
          className="w-full h-12 border-dashed"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
          type="button"
        >
          {uploadProps.loading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>
    </div>
  );
};

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
            <TourImagesFieldContent field={field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
