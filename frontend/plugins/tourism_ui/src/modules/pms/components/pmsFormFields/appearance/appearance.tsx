import { useState } from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ColorPicker,
  Form,
  InfoCard,
  Label,
  Input,
  readImage,
  Spinner,
  Upload,
} from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const LogoField = ({
  control,
  name,
  label,
}: {
  control: Control<PmsBranchFormType>;
  name: keyof Pick<PmsBranchFormType, 'logo'>;
  label: string;
}) => {
  const { t } = useTranslation('tourism');
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
                } else if (
                  fileInfo &&
                  typeof fileInfo === 'object' &&
                  'url' in fileInfo
                ) {
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
                    className={`flex overflow-hidden relative flex-col justify-center items-center w-full h-28 rounded-md border border-border text-muted-foreground group bg-background ${
                      field.value ? '' : 'border-dashed'
                    }`}
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
                      <div className="flex relative z-10 flex-col gap-3 justify-center items-center">
                        <IconUpload size={20} />
                        <span className="text-xs text-muted-foreground">
                          {t('max-size-file-type')}
                        </span>
                      </div>
                    )}

                    {field.value && (
                      <div className="flex absolute inset-0 justify-center items-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

const Appearance = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { t } = useTranslation('tourism');
  return (
    <PmsFormFieldsLayout>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard title={t('logo-title')}>
          <InfoCard.Content>
            <LogoField control={control} name="logo" label={t('main-logo')} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('main-colors')}>
          <InfoCard.Content>
            <Label>{t('colors')}</Label>
            <div className="flex gap-6">
              <Form.Field
                control={control}
                name="primaryColor"
                render={({ field }) => (
                  <Form.Item className="space-y-2">
                    <Label>{t('primary-label')}</Label>
                    <Form.Control>
                      <ColorPicker
                        className="w-20 h-8"
                        value={field.value || ''}
                        onValueChange={(value: string) => field.onChange(value)}
                      />
                    </Form.Control>
                    <Form.Message className="text-destructive" />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name="secondaryColor"
                render={({ field }) => (
                  <Form.Item className="space-y-2">
                    <Label>{t('secondary')}</Label>
                    <Form.Control>
                      <ColorPicker
                        className="w-20 h-8"
                        value={field.value || ''}
                        onValueChange={(value: string) => field.onChange(value)}
                      />
                    </Form.Control>
                    <Form.Message className="text-destructive" />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name="thirdColor"
                render={({ field }) => (
                  <Form.Item className="space-y-2">
                    <Label>{t('third')}</Label>
                    <Form.Control>
                      <ColorPicker
                        className="w-20 h-8"
                        value={field.value || ''}
                        onValueChange={(value: string) => field.onChange(value)}
                      />
                    </Form.Control>
                    <Form.Message className="text-destructive" />
                  </Form.Item>
                )}
              />
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>

      <InfoCard title={t('infos')}>
        <InfoCard.Content>
          <Form.Field
            control={control}
            name="website"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('website')}</Form.Label>

                <Form.Control>
                  <Input {...field} placeholder={t('website-url')} />
                </Form.Control>
                <Form.Message className="text-destructive" />
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>
    </PmsFormFieldsLayout>
  );
};

export default Appearance;
