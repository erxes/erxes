import { Control, FieldPathByValue } from 'react-hook-form';
import { Input, Upload, readImage } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME } from 'ui-modules';
import { TourismPanelFormField } from '@/tms/side-panel/TourismPanelForm';
import { useTranslation } from 'react-i18next';
import { CategoryCreateFormType } from '../constants/formSchema';
import { SelectParentCategory } from './SelectParentCategory';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

type CategoryTextFieldPath = FieldPathByValue<
  CategoryCreateFormType,
  string | undefined
>;

interface CategoryNameFieldProps {
  control: Control<CategoryCreateFormType>;
  name?: CategoryTextFieldPath;
  labelSuffix?: string;
}

export const CategoryNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: CategoryNameFieldProps) => {
  const { t } = useTranslation('tourism');
  return (
    <TourismPanelFormField
      control={control}
      name={name}
      required
      label={
        <>
          {t('name')}
          <span className="text-primary">{labelSuffix}</span>
        </>
      }
      render={(field) => (
        <Input
          placeholder={t('category-name-placeholder')}
          className={PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const CategoryCodeField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <TourismPanelFormField
      control={control}
      name="code"
      required
      label={t('code')}
      render={(field) => (
        <Input
          placeholder={t('category-code-placeholder')}
          className={PANEL_INPUT_CLASS_NAME}
          {...field}
        />
      )}
    />
  );
};

export const CategoryParentIdField = ({
  control,
  branchId,
  language,
}: {
  control: Control<CategoryCreateFormType>;
  branchId?: string;
  language?: string;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <TourismPanelFormField
      control={control}
      name="parentId"
      label={t('parent-category')}
      render={(field) => (
        <SelectParentCategory
          selected={field.value}
          onSelect={field.onChange}
          branchId={branchId}
          language={language}
        />
      )}
    />
  );
};

export const CategoryAttachmentField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TourismPanelFormField
      control={control}
      name="attachment"
      block
      label={t('category-image')}
      render={(field) => (
        <Upload.Root
          value={field.value?.url || ''}
          onChange={(fileInfo) => {
            if (typeof fileInfo === 'string') {
              field.onChange({ ...field.value, url: fileInfo });
            } else if (fileInfo && 'url' in fileInfo) {
              field.onChange(fileInfo);
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
              field.value?.url
                ? {
                    backgroundImage: `url(${readImage(field.value.url)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            }
          >
            {!field.value?.url && (
              <div className="flex flex-col gap-2 justify-center items-center text-sm text-muted-foreground">
                {isLoading ? (
                  <span>{t('uploading')}</span>
                ) : (
                  <>
                    <IconUpload size={22} />
                    <span>{t('upload-category-image')}</span>
                  </>
                )}
              </div>
            )}

            {field.value?.url && (
              <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
                <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 bg-black/70">
                  {t('change-image')}
                </span>
              </div>
            )}
          </Upload.Button>

          {field.value?.url && (
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
      )}
    />
  );
};
