import { Button, Form, Upload, ColorPicker } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { IconUpload } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UiConfigFormValues } from '../formSchema';
import { IPosDetail } from '@/pos-detail/types/IPos';

interface AppearanceFormProps {
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: UiConfigFormValues) => Promise<void>;
}

interface AppearanceFormData {
  logoImage: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  showLogo: boolean;
}

export default function AppearanceForm({
  posDetail,
  isReadOnly = false,
  onSubmit,
}: AppearanceFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const form = useForm<AppearanceFormData>({
    defaultValues: {
      logoImage: '',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      accentColor: '#6366F1',
      fontFamily: 'Inter',
      showLogo: true,
    },
  });

  useEffect(() => {
    if (posDetail?.uiOptions) {
      form.reset({
        logoImage: posDetail.uiOptions.logoImage || '',
        backgroundColor: posDetail.uiOptions.backgroundColor || '#FFFFFF',
        textColor: posDetail.uiOptions.textColor || '#000000',
        accentColor: posDetail.uiOptions.accentColor || '#6366F1',
        fontFamily: posDetail.uiOptions.fontFamily || 'Inter',
        showLogo: posDetail.uiOptions.showLogo ?? true,
      });
    } else {
      form.reset({
        logoImage: '',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        accentColor: '#6366F1',
        fontFamily: 'Inter',
        showLogo: true,
      });
    }
  }, [posDetail]);

  const handleSubmit = async (data: AppearanceFormData) => {
    if (onSubmit) {
      try {
        await onSubmit({
          uiOptions: {
            colors: {
              bodyColor: data.backgroundColor,
              headerColor: data.accentColor,
              footerColor: data.textColor,
            },
            logo: data.logoImage,
            bgImage: '',
            favIcon: '',
            receiptIcon: '',
            kioskHeaderImage: '',
            mobileAppImage: '',
            qrCodeImage: '',
          },
          beginNumber: '',
          maxSkipNumber: 0,
          checkRemainder: false,
        });
      } catch (error) {
        console.error('Appearance form submission failed:', error);
      }
    } else {
      console.log('Appearance form submitted:', data);
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
              name="logoImage"
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
                      className="h-[128px]"
                    >
                      <Upload.Preview className="hidden" />
                      <Upload.Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="w-full h-[128px] flex flex-col items-center justify-center border border-dashed border-muted-foreground text-muted-foreground"
                        disabled={isReadOnly}
                      >
                        <div className="flex flex-col gap-3 justify-center">
                          <div className="flex justify-center">
                            <IconUpload />
                          </div>
                          <Button disabled={isReadOnly}>Upload</Button>
                          <span className="font-medium text-sm">
                            Upload Image
                          </span>
                        </div>
                      </Upload.Button>
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
                name="backgroundColor"
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
                name="textColor"
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
                name="accentColor"
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
        </form>
      </Form>
    </div>
  );
}
