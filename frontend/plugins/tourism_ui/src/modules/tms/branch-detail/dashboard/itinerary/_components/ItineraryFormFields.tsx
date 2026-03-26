import { Control } from 'react-hook-form';
import {
  Form,
  Input,
  ColorPicker,
  Button,
  Upload,
  readImage,
  Editor,
} from 'erxes-ui';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { IconMinus, IconUpload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export const ItineraryNameField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Itinerary name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryContentField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="content"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Content</Form.Label>
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
          <Form.Label>
            Color <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <ColorPicker
              value={field.value || '#4F46E5'}
              onValueChange={field.onChange}
              className="w-24 h-8"
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
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="guideCost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Guide's daily wage</Form.Label>
          <Form.Control>
            <Input
              type="number"
              placeholder="0"
              {...field}
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryDriverCostField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="driverCost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Driver's daily wage</Form.Label>
          <Form.Control>
            <Input
              type="number"
              placeholder="0"
              {...field}
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryFoodCostField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="foodCost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Daily cost of food per person</Form.Label>
          <Form.Control>
            <Input
              type="number"
              placeholder="0"
              {...field}
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryGasCostField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="gasCost"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Gasoline fee per car</Form.Label>
          <Form.Control>
            <Input
              type="number"
              placeholder="0"
              {...field}
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const ItineraryGuideCostExtraField = ({
  control,
}: {
  control: Control<ItineraryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="guideCostExtra"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Total price of a additive assistant</Form.Label>
          <Form.Control>
            <Input
              type="number"
              placeholder="0"
              {...field}
              value={field.value || 0}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
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
