import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { IconX } from '@tabler/icons-react';

import {
  Form,
  Input,
  Editor,
  Select,
  Button,
  Checkbox,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  readImage,
  IAttachment,
  Label,
} from 'erxes-ui';
import { nanoid } from 'nanoid';
import { SelectBrand } from 'ui-modules';
import { ProductFormValues } from './formSchema';
import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';

export const ACCOUNT_CATEGORY_MASK_TYPES = [
  { label: 'Any', value: 'any' },
  { label: 'Soft', value: 'soft' },
  { label: 'Hard', value: 'hard' },
  { label: 'All', value: 'all' },
];

export const PRODUCT_CATEGORIES_STATUS = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' },
];

export const ProductCategoryAddMoreFields = ({
  form,
  files = [],
  isLoading = false,
  uploadProps,
  onRemoveFile,
  fieldGroups = [],
  fields = [],
}: {
  form: UseFormReturn<ProductFormValues>;
  files?: IAttachment[];
  isLoading?: boolean;
  uploadProps?: any;
  onRemoveFile?: (file: IAttachment) => void;
  fieldGroups?: { _id: string; name: string }[];
  fields?: { _id: string; name: string; groupId?: string }[];
}) => {
  const isSimilarityChecked = form.watch('isSimilarity');
  const similarities = form.watch('similarities') || [];

  useEffect(() => {
    if (isSimilarityChecked && similarities.length === 0) {
      form.setValue('similarities', [
        {
          id: nanoid(),
          title: '',
          groupId: '',
          fieldId: '',
        },
      ]);
    }

    if (!isSimilarityChecked && similarities.length) {
      form.setValue('similarities', []);
    }
  }, [form, isSimilarityChecked, similarities.length]);

  const updateSimilarityRow = (
    id: string,
    key: 'title' | 'groupId' | 'fieldId',
    value: string,
  ) => {
    form.setValue(
      'similarities',
      similarities.map((item: any) =>
        item.id === id
          ? {
              ...item,
              [key]: value,
              ...(key === 'groupId' ? { fieldId: '' } : {}),
            }
          : item,
      ),
    );
  };

  return (
    <>
      <div className="flex items-center my-4">
        <div className="flex-1 border-t" />
        <Form.Label className="mx-2">More Info</Form.Label>
        <div className="flex-1 border-t" />
      </div>
      <Form.Field
        control={form.control}
        name="meta"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>META</Form.Label>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="scopeBrandIds"
        render={({ field }) => (
          <Form.Item className="flex flex-col mb-5">
            <Form.Label>BRAND</Form.Label>
            <Form.Control>
              <SelectBrand
                value={field.value?.[0] || ''}
                onValueChange={(brandId) => {
                  field.onChange([brandId]);
                }}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Label>DESCRIPTION</Form.Label>
            <Form.Control>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                scope={CategoryHotKeyScope.CategoryAddSheetDescriptionField}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="isSimilarity"
        render={({ field }) => (
          <Form.Item className="mb-5">
            <Form.Control>
              <div className="flex gap-2 items-center">
                <Checkbox
                  id="isSimilarity"
                  checked={field.value || false}
                  onCheckedChange={(val) => field.onChange(!!val)}
                />

                <Label htmlFor="isSimilarity" className="cursor-pointer">
                  Has similarities group
                </Label>
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      {isSimilarityChecked && (
        <div className="p-3 mb-5 space-y-3 rounded-lg border">
          {similarities.map((item: any) => (
            <div key={item.id} className="space-y-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) =>
                    updateSimilarityRow(item.id, 'title', e.target.value)
                  }
                  placeholder="Enter title"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Field group</Label>
                  <Select
                    value={item.groupId || ''}
                    onValueChange={(val) =>
                      updateSimilarityRow(item.id, 'groupId', val)
                    }
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Field group" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {fieldGroups.map((group) => (
                        <Select.Item key={group._id} value={group._id}>
                          {group.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Field</Label>
                  <Select
                    value={item.fieldId || ''}
                    onValueChange={(val) =>
                      updateSimilarityRow(item.id, 'fieldId', val)
                    }
                    disabled={!item.groupId}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Field" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {fields
                        .filter(
                          (field) =>
                            !item.groupId || field.groupId === item.groupId,
                        )
                        .map((field) => (
                          <Select.Item key={field._id} value={field._id}>
                            {field.name}
                          </Select.Item>
                        ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Form.Field
        control={form.control}
        name="attachment"
        render={() => (
          <Form.Item className="mb-5">
            <Form.Label>UPLOAD</Form.Label>
            <Form.Control>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  {files.map((f) => (
                    <div
                      key={f.url}
                      className="overflow-hidden relative w-32 rounded-md aspect-square shadow-xs"
                    >
                      <img
                        src={readImage(f.url)}
                        alt={f.name}
                        className="object-contain w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0"
                        disabled={isLoading}
                        onClick={() => onRemoveFile?.(f)}
                      >
                        <IconX size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                {uploadProps && (
                  <Dropzone {...uploadProps}>
                    <DropzoneEmptyState />
                    <DropzoneContent />
                  </Dropzone>
                )}
              </div>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="status"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>State</Form.Label>
            <Select onValueChange={field.onChange} value={field.value}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Choose type">
                    {
                      PRODUCT_CATEGORIES_STATUS.find(
                        (type) => type.value === field.value,
                      )?.label
                    }
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {PRODUCT_CATEGORIES_STATUS.map((type) => (
                  <Select.Item key={type.value} value={type.value}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
