'use client';

import {
  Button,
  Form,
  Upload,
  ColorPicker,
  Spinner,
  readImage,
} from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useForm, UseFormReturn, Control, Path } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { UiConfigFormValues } from '../formSchema';
import { IPosDetail } from '~/modules/pos/pos-detail/types/IPos';

interface AppearanceFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: UiConfigFormValues) => Promise<void>;
  form?: UseFormReturn<UiConfigFormValues>;
}

export default function AppearanceForm({
  posDetail,
  isReadOnly = false,
  onSubmit,
  form: externalForm,
}: AppearanceFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const internalForm = useForm<UiConfigFormValues>({
    defaultValues: {
      uiOptions: {
        colors: {
          bodyColor: '#FFFFFF',
          headerColor: '#6569DF',
          footerColor: '#3CCC38',
        },
        logo: '',
        bgImage: '',
        favIcon: '',
        receiptIcon: '',
        kioskHeaderImage: '',
        mobileAppImage: '',
        qrCodeImage: '',
      },
      beginNumber: '',
      maxSkipNumber: 5,
      checkRemainder: false,
    },
  });

  const form = externalForm || internalForm;

  useEffect(() => {
    if (posDetail && !externalForm) {
      form.reset({
        uiOptions: posDetail.uiOptions || {
          colors: {
            bodyColor: '#FFFFFF',
            headerColor: '#6569DF',
            footerColor: '#3CCC38',
          },
          logo: '',
          bgImage: '',
          favIcon: '',
          receiptIcon: '',
          kioskHeaderImage: '',
          mobileAppImage: '',
          qrCodeImage: '',
        },
        beginNumber: posDetail.beginNumber || '',
        maxSkipNumber: posDetail.maxSkipNumber || 5,
        checkRemainder: posDetail.checkRemainder || false,
      });
    }
  }, [posDetail, form, externalForm]);

  const handleSubmit = async (data: UiConfigFormValues) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', 'screen');
      setSearchParams(newParams);
    }
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-medium uppercase text-primary">
              Logo and favicon
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.logo"
                label="MAIN LOGO"
                hint="Pos main logo PNG"
              />

              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.bgImage"
                label="BACKGROUND IMAGE"
                hint="Pos background Image PNG"
              />

              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.favIcon"
                label="FAVICON"
                hint="16x16px transparent PNG"
              />

              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.kioskHeaderImage"
                label="KIOSK HEADER IMAGE"
                hint="Kiosk header image PNG"
              />

              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.mobileAppImage"
                label="MOBILE APP IMAGE"
                hint="Mobile app image PNG"
              />

              <LogoField
                control={form.control}
                isReadOnly={isReadOnly}
                name="uiOptions.qrCodeImage"
                label="QR CODE IMAGE"
                hint="QR code image PNG"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium uppercase text-primary">
              Main colors
            </h2>

            <div className="flex gap-4">
              <Form.Field
                control={form.control}
                name="uiOptions.colors.bodyColor"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-xs font-semibold">
                      Primary
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-8"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="uiOptions.colors.footerColor"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-xs font-semibold">
                      Secondary
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-8"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="uiOptions.colors.headerColor"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-xs font-semibold">
                      Third
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-8"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export const LogoField = <TPath extends Path<UiConfigFormValues>>({
  control,
  name = 'uiOptions.logo' as TPath,
  label = 'LOGO',
  hint = 'Image can be shown on the top of the post also',
  isReadOnly = false,
}: {
  control: Control<UiConfigFormValues>;
  name?: TPath;
  label?: string;
  hint?: string;
  isReadOnly?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      name={name as Path<UiConfigFormValues>}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Description>{hint}</Form.Description>
          <Form.Control>
            <Upload.Root
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={(fileInfo) => {
                if (typeof fileInfo === 'string') {
                  field.onChange(fileInfo);
                } else if ('url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
              className="relative group"
            >
              {isLoading ? (
                <div className="flex flex-col justify-center items-center w-full h-28 rounded-md border border-dashed bg-accent">
                  <Spinner className="text-muted-foreground" size="md" />
                </div>
              ) : (
                <>
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="flex overflow-hidden relative flex-col justify-center items-center w-full h-28 border border-dashed border-muted-foreground text-muted-foreground group"
                    disabled={isReadOnly}
                    style={
                      typeof field.value === 'string' && field.value
                        ? {
                            backgroundImage: `url(${readImage(field.value)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            border: 'none',
                          }
                        : {}
                    }
                  >
                    {!field.value && (
                      <div className="flex relative z-10 flex-col gap-2 justify-center items-center">
                        <IconUpload />
                        <Button
                          variant="outline"
                          disabled={isReadOnly}
                          className="text-sm font-medium"
                        >
                          Upload
                        </Button>

                        <span className="text-xs text-muted-foreground">
                          Max size: 15MB, File type: PNG
                        </span>
                      </div>
                    )}

                    {field.value && (
                      <div className="flex absolute inset-0 justify-center items-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div className="px-3 py-1.5 text-xs font-medium text-black rounded-lg backdrop-blur-sm bg-white/90">
                            Click to change image
                          </div>
                        </div>
                      </div>
                    )}
                  </Upload.Button>
                  {field.value && (
                    <Upload.RemoveButton
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 z-30 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      disabled={isReadOnly}
                    >
                      <IconTrash size={16} />
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
