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
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input
              placeholder="Itinerary name"
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
  return (
    <Form.Field
      control={control}
      name="color"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Color</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Content<span className="text-primary">{labelSuffix}</span>
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
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Guide's daily wage</Form.Label>
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
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Driver's daily wage</Form.Label>
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
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Daily cost of food per person</Form.Label>
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
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Gasoline fee per car</Form.Label>
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
  const lang = useAtomValue(activeLangAtom);
  const symbol =
    currencySymbol ?? LANGUAGES.find((l) => l.value === lang)?.symbol ?? '$';
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Total price of a additive assistant</Form.Label>
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
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      control={control}
      name="images"
      render={({ field }) => {
        const imageUrl = field.value?.[0] || '';

        return (
          <Form.Item>
            <Form.Label>Itinerary Image</Form.Label>

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
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <IconUpload size={22} />
                          <span>Upload itinerary image</span>
                        </>
                      )}
                    </div>
                  )}

                  {imageUrl && (
                    <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
                      <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 bg-black/70 group-hover:opacity-100">
                        Change image
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
  return (
    <div className="space-y-3">
      <Form.Label>The daily cost per person</Form.Label>
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
                      placeholder={`Cost for day ${i + 1}`}
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
