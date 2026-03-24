import { Control } from 'react-hook-form';
import { Form, Input, ColorPicker, Button } from 'erxes-ui';
import { ItineraryCreateFormType } from '../constants/formSchema';
import { IconMinus } from '@tabler/icons-react';

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
              value={field.value || '#000000'}
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
