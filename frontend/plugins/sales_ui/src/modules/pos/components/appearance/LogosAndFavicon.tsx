import { useState, useEffect, useRef } from 'react';
import { Button, Form, Upload, Spinner, readImage, toast } from 'erxes-ui';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';
import { Control, useForm } from 'react-hook-form';
import { isFieldVisible } from '@/pos/constants';
import { cleanData } from '@/pos/utils/cleanData';

interface LogosAndFaviconProps {
  posId?: string;
  posType?: string;
}

interface UiOptionsFormValues {
  logo?: string;
  bgImage?: string;
  favIcon?: string;
  receiptIcon?: string;
  kioskHeaderImage?: string;
  mobileAppImage?: string;
  qrCodeImage?: string;
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

const LogoField = ({
  control,
  name,
  label,
}: {
  control: Control<UiOptionsFormValues>;
  name: keyof UiOptionsFormValues;
  label: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="text-xs">{label}</Form.Label>
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
                <div className="flex flex-col justify-center items-center w-full h-28 rounded-md border border-dashed bg-accent">
                  <Spinner className="text-muted-foreground" size="md" />
                </div>
              ) : (
                <>
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="flex overflow-hidden relative flex-col justify-center items-center w-full h-28 rounded-md border border-dashed border-border text-muted-foreground group"
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
  posId,
  posType,
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const form = useForm<UiOptionsFormValues>({
    defaultValues: {
      logo: '',
      bgImage: '',
      favIcon: '',
      receiptIcon: '',
      kioskHeaderImage: '',
      mobileAppImage: '',
      qrCodeImage: '',
    },
  });

  const isResetting = useRef(false);

  useEffect(() => {
    if (posDetail?.uiOptions) {
      isResetting.current = true;
      form.reset(posDetail.uiOptions);
      setHasChanges(false);
      setTimeout(() => {
        isResetting.current = false;
      }, 100);
    }
  }, [posDetail, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (!isResetting.current) {
        setHasChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const existingUiOptions = cleanData(posDetail?.uiOptions || {});
      const formValues = form.getValues();
      const uiOptions = { ...existingUiOptions, ...formValues };

      await posEdit({
        variables: {
          _id: posId,
          uiOptions,
        },
      });

      toast({
        title: 'Success',
        description: 'Logos and favicon saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save logos and favicon',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="space-y-2">
            <div className="w-20 h-4 rounded animate-pulse bg-muted" />
            <div className="w-full h-28 rounded-md animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="grid grid-cols-4 gap-4">
          {imageFields
            .filter((field) => isFieldVisible(field.configKey, posType))
            .map((field) => (
              <LogoField
                key={field.key}
                control={form.control}
                name={field.key}
                label={field.label}
              />
            ))}
        </div>
      </Form>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
