import { Control, FieldPathByValue } from 'react-hook-form';
import {
  Form,
  Input,
  Button,
  Upload,
  readImage,
  Editor,
  ColorPicker,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { LANGUAGES } from '@/tms/constants/languages';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { IconMinus, IconUpload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

type ItineraryTextFieldPath = FieldPathByValue<
  ItineraryCreateFormType,
  string | undefined
>;

type ItineraryNumberFieldPath = FieldPathByValue<
  ItineraryCreateFormType,
  number | undefined
>;

interface ItineraryNameFieldProps {
  control: Control<ItineraryCreateFormType>;
  name?: ItineraryTextFieldPath;
  labelSuffix?: string;
}

interface ItineraryContentFieldProps {
  control: Control<ItineraryCreateFormType>;
  name?: ItineraryTextFieldPath;
  labelSuffix?: string;
}

interface ItineraryCostFieldProps {
  control: Control<ItineraryCreateFormType>;
  name?: ItineraryNumberFieldPath;
  currencySymbol?: string;
}

export const ItineraryNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: ItineraryNameFieldProps) => {
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('name')}<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input
              placeholder={t('itinerary-name')}
              {...field}
              value={field.value || ''}
            />
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
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name="color"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('color')}</Form.Label>
          <Form.Control>
            <ColorPicker
              value={field.value}
              onValueChange={(value: any) => {
                field.onChange(value);
              }}
              className="w-24"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryContentField = ({
  control,
  name = 'content',
  labelSuffix = '',
}: ItineraryContentFieldProps) => {
  const { t } = useTranslation('tourism');
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('content')}<span className="text-primary">{labelSuffix}</span>
          </Form.Label>
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

export const ItineraryGuideCostField = ({
  control,
  name = 'guideCost',
  currencySymbol,
}: ItineraryCostFieldProps) => {
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('guides-daily-wage')}</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryDriverCostField = ({
  control,
  name = 'driverCost',
  currencySymbol,
}: ItineraryCostFieldProps) => {
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('drivers-daily-wage')}</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryFoodCostField = ({
  control,
  name = 'foodCost',
  currencySymbol,
}: ItineraryCostFieldProps) => {
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('daily-cost-of-food')}</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryGasCostField = ({
  control,
  name = 'gasCost',
  currencySymbol,
}: ItineraryCostFieldProps) => {
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('gasoline-fee-per-car')}</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryGuideCostExtraField = ({
  control,
  name = 'guideCostExtra',
  currencySymbol,
}: ItineraryCostFieldProps) => {
  const { t } = useTranslation('tourism');
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('total-price-additive-assistant')}</Form.Label>
          <Form.Control>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {symbol}
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                value={field.value || 0}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryImageField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  const { t } = useTranslation('tourism');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      control={control}
      name="images"
      render={({ field }) => {
        const imageUrl = field.value?.[0] || '';

        return (
          <Form.Item>
            <Form.Label>{t('itinerary-image')}</Form.Label>

            <Form.Control>
              <Upload.Root
                value={imageUrl}
                onChange={(fileInfo) => {
                  if (typeof fileInfo === 'string') {
                    field.onChange(fileInfo ? [fileInfo] : []);
                    return;
                  }

                  if (fileInfo && 'url' in fileInfo) {
                    field.onChange(fileInfo.url ? [fileInfo.url] : []);
                  }
                }}
                className="relative group"
              >
                <Upload.Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  className="relative aspect-video min-h-[94px] w-full overflow-hidden rounded-md border border-dashed bg-background transition hover:bg-accent"
                  style={
                    imageUrl
                      ? {
                          backgroundImage: `url(${readImage(imageUrl)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                >
                  {!imageUrl && (
                    <div className="flex flex-col gap-2 justify-center items-center text-sm text-muted-foreground">
                      {isLoading ? (
                        <span>{t('uploading')}</span>
                      ) : (
                        <>
                          <IconUpload size={22} />
                          <span>{t('upload-itinerary-image')}</span>
                        </>
                      )}
                    </div>
                  )}

                  {imageUrl && (
                    <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
                      <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 bg-black/70 group-hover:opacity-100">
                        {t('change-image')}
                      </span>
                    </div>
                  )}
                </Upload.Button>

                {imageUrl && (
                  <Upload.RemoveButton
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 shadow opacity-0 group-hover:opacity-100"
                    onClick={() => field.onChange([])}
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
            </Form.Control>

            <Form.Message className="text-destructive" />
          </Form.Item>
        );
      }}
    />
  );
};

export const ItineraryPersonCostField = ({
  control,
  duration,
}: {
  control: Control<ItineraryCreateFormType>;
  duration: number;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <div className="space-y-3">
      <Form.Label>{t('daily-cost-per-person')}</Form.Label>
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: duration }, (_, i) => {
          const dayKey = `day${i + 1}`;
          return (
            <Form.Field
              key={dayKey}
              control={control}
              name={`personCost.${dayKey}`}
              render={({ field }) => (
                <Form.Item className="flex gap-2 items-center space-y-0">
                  <Form.Control className="flex-1">
                    <Input
                      type="number"
                      placeholder={t('cost-for-day', { day: i + 1 })}
                      value={field.value || 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Form.Control>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled
                  >
                    <IconMinus className="w-4 h-4" />
                  </Button>
                </Form.Item>
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
