import { useState } from 'react';
import { Form, Upload, Spinner, readImage } from 'erxes-ui';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Control } from 'react-hook-form';
import type { AppearanceFormData } from './Appearance';
import { useTranslation } from 'react-i18next';

interface LogosAndFaviconProps {
  control: Control<AppearanceFormData>;
  posType?: string;
}

const imageFields = [
  {
    key: 'logo',
    label: 'main-logo',
    configKey: 'posMainLogo',
  },
  {
    key: 'bgImage',
    label: 'background-image',
    configKey: 'backgroundImage',
  },
  {
    key: 'favIcon',
    label: 'favicon',
    configKey: 'logosFavicon',
  },
  {
    key: 'receiptIcon',
    label: 'receipt-icon',
    configKey: 'receiptIcon',
  },
  {
    key: 'kioskHeaderImage',
    label: 'kiosk-header-image',
    configKey: 'kioskHeader',
  },
  {
    key: 'mobileAppImage',
    label: 'mobile-app-image',
    configKey: 'mobileAppImage',
  },
  {
    key: 'qrCodeImage',
    label: 'qr-code-image',
    configKey: 'qrCodeImage',
  },
] as const;

type ImageFieldName = (typeof imageFields)[number]['key'];

const ImageUploadField = ({
  control,
  name,
  label,
}: {
  control: Control<AppearanceFormData>;
  name: ImageFieldName;
  label: string;
}) => {
  const { t } = useTranslation('sales');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="text-xs">{t(label)}</Form.Label>
          <Form.Control>
            <Upload.Root
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(fileInfo) => {
                if (typeof fileInfo === 'string') {
                  field.onChange(fileInfo);
                  return;
                }

                if (
                  typeof fileInfo === 'object' &&
                  fileInfo !== null &&
                  'url' in fileInfo
                ) {
                  field.onChange(fileInfo.url);
                } else {
                  field.onChange('');
                }
              }}
              className="relative group"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full border border-dashed rounded-md h-28 bg-accent">
                  <Spinner className="text-muted-foreground" size="md" />
                </div>
              ) : (
                <>
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className={`flex overflow-hidden relative flex-col justify-center items-center w-full h-28 rounded-md border border-border text-muted-foreground group bg-background ${
                      field.value ? '' : 'border-dashed'
                    }`}
                    style={
                      field.value
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
                      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                        <IconUpload size={20} />
                      </div>
                    )}

                    {field.value && (
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                          <div className="px-2 py-1 text-xs font-medium text-black rounded-lg backdrop-blur-sm bg-white/90">
                            {t('change')}
                          </div>
                        </div>
                      </div>
                    )}
                  </Upload.Button>

                  {field.value && (
                    <Upload.RemoveButton
                      size="sm"
                      variant="destructive"
                      className="absolute z-30 transition-opacity duration-200 shadow-lg opacity-0 top-2 right-2 group-hover:opacity-100"
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
        </Form.Item>
      )}
    />
  );
};

export const LogosAndFavicon: React.FC<LogosAndFaviconProps> = ({
  control,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {imageFields
          .map((configField) => (
            <ImageUploadField
              key={configField.key}
              control={control}
              name={configField.key}
              label={configField.label}
            />
          ))}
      </div>
    </div>
  );
};
