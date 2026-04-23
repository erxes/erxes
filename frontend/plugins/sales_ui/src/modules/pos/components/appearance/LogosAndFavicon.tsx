import { useState } from 'react';
import { Form, Upload, Spinner, readImage } from 'erxes-ui';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { Control, Controller } from 'react-hook-form';
import { isFieldVisible } from '@/pos/constants';
import type { AppearanceFormData } from './Appearance';

interface LogosAndFaviconProps {
  control: Control<AppearanceFormData>;
  posType?: string;
}

const imageFields = [
  { key: 'logo', label: 'MAIN LOGO', configKey: 'posMainLogo' },
  { key: 'bgImage', label: 'BACKGROUND IMAGE', configKey: 'backgroundImage' },
  { key: 'favIcon', label: 'FAVICON', configKey: 'logosFavicon' },
  { key: 'receiptIcon', label: 'RECEIPT ICON', configKey: 'receiptIcon' },
  {
    key: 'kioskHeaderImage',
    label: 'KIOSK HEADER IMAGE',
    configKey: 'kioskHeader',
  },
  {
    key: 'mobileAppImage',
    label: 'MOBILE APP IMAGE',
    configKey: 'mobileAppImage',
  },
  { key: 'qrCodeImage', label: 'QR CODE IMAGE', configKey: 'qrCodeImage' },
] as const;

export const LogosAndFavicon: React.FC<LogosAndFaviconProps> = ({
  control,
  posType,
}) => {
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
    {},
  );

  const handleUploadStart = (key: string) => {
    setLoadingFields((prev) => ({ ...prev, [key]: true }));
  };

  const handleUploadComplete = (key: string) => {
    setLoadingFields((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {imageFields
          .filter((configField) =>
            isFieldVisible(configField.configKey, posType),
          )
          .map((configField) => {
            const isLoading = loadingFields[configField.key] || false;

            return (
              <Controller
                key={configField.key}
                name={configField.key as keyof AppearanceFormData}
                control={control}
                render={({ field }) => (
                  <Form.Field
                    name={field.name}
                    control={control}
                    render={() => (
                      <Form.Item>
                        <Form.Label className="text-xs">
                          {configField.label}
                        </Form.Label>
                        <Form.Control>
                          <Upload.Root
                            value={
                              typeof field.value === 'string' ? field.value : ''
                            }
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
                              <div className="flex flex-col justify-center items-center w-full h-28 rounded-md border border-dashed bg-accent">
                                <Spinner
                                  className="text-muted-foreground"
                                  size="md"
                                />
                              </div>
                            ) : (
                              <>
                                <Upload.Button
                                  size="sm"
                                  variant="secondary"
                                  type="button"
                                  className="flex overflow-hidden relative flex-col justify-center items-center w-full h-28 rounded-md border border-dashed border-border text-muted-foreground group"
                                  style={
                                    typeof field.value === 'string' &&
                                    field.value
                                      ? {
                                          backgroundImage: `url(${readImage(
                                            field.value,
                                          )})`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          backgroundRepeat: 'no-repeat',
                                          border: 'none',
                                        }
                                      : {}
                                  }
                                >
                                  {!field.value && (
                                    <div className="flex relative z-10 flex-col gap-1 justify-center items-center">
                                      <IconUpload size={20} />
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
                                    onUploadStart={() =>
                                      handleUploadStart(configField.key)
                                    }
                                    onAllUploadsComplete={() =>
                                      handleUploadComplete(configField.key)
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </Upload.Root>
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
              />
            );
          })}
      </div>
    </div>
  );
};
