import { Control } from 'react-hook-form';
import {
  Form,
  Input,
  Editor,
  Upload,
  readImage,
  useErxesUpload,
  Button,
} from 'erxes-ui';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

export const ItineraryNameField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
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
            <Input placeholder="Itinerary name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryDescriptionField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
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

export const ItineraryDurationField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
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

export const ItineraryColorField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="color"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Color</Form.Label>
          <Form.Control>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                className="w-16 h-10"
                {...field}
                value={field.value || '#000000'}
              />
              <Input
                type="text"
                placeholder="#000000"
                {...field}
                value={field.value || ''}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryTotalCostField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="totalCost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Total Cost</Form.Label>
          <Form.Control>
            <Input type="number" placeholder="0" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const ItineraryImagesFieldContent = ({
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

export const ItineraryImagesField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="images"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Itinerary Images</Form.Label>
          <Form.Control>
            <ItineraryImagesFieldContent field={field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
