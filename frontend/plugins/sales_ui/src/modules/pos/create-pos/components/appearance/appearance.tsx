'use client';

import { Button, Form, Upload, ColorPicker, readImage } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';
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

  // Initialize form with posDetail data
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
            <h2 className="text-[#4F46E5] text-lg font-semibold uppercase">
              Logo and favicon
            </h2>
            <p className="text-[#A1A1AA] text-xs font-semibold uppercase">
              Main logo
            </p>

            <Form.Field
              control={form.control}
              name="uiOptions.logo"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="block mb-2 font-medium text-[#71717A]">
                    Image can be shown on the top of the post also
                  </Form.Label>
                  <Form.Control>
                    <Upload.Root
                      value={field.value}
                      onChange={(fileInfo) => {
                        if (typeof fileInfo === 'string') {
                          field.onChange(fileInfo);
                        } else if ('url' in fileInfo) {
                          field.onChange(fileInfo.url);
                        }
                      }}
                      className="h-[240px] relative group"
                    >
                      <Upload.Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="w-full h-[240px] flex flex-col items-center justify-center border border-dashed border-muted-foreground text-muted-foreground relative overflow-hidden group"
                        disabled={isReadOnly}
                        style={
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
                          <div className="flex flex-col gap-3 justify-center relative z-10">
                            <div className="flex justify-center">
                              <IconUpload />
                            </div>
                            <Button disabled={isReadOnly}>Upload</Button>
                            <span className="font-medium text-sm">
                              Upload Image
                            </span>
                          </div>
                        )}

                        {field.value && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-black font-medium text-sm">
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
                          className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          disabled={isReadOnly}
                        >
                          <IconTrash size={16} />
                        </Upload.RemoveButton>
                      )}
                      <div className="hidden">
                        <Upload.Preview />
                      </div>
                    </Upload.Root>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-[#4F46E5] text-lg font-semibold uppercase">
              Main colors
            </h2>
            <div className="flex gap-4">
              <Form.Field
                control={form.control}
                name="uiOptions.colors.bodyColor"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-[#A1A1AA] text-xs font-semibold">
                      Primary
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-9"
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
                    <Form.Label className="text-[#A1A1AA] text-xs font-semibold">
                      Secondary
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-9"
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
                    <Form.Label className="text-[#A1A1AA] text-xs font-semibold">
                      Third
                    </Form.Label>
                    <Form.Control>
                      <ColorPicker
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                        className="w-20 h-9"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </div>

          {onSubmit && (
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isReadOnly}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
