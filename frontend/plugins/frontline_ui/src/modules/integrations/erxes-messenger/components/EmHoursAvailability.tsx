import {
  TimeField,
  DateInput,
  Switch,
  ScrollArea,
  Form,
  RadioGroup,
  Button,
  cn,
  TimezoneSelect,
  detectTimeZone,
} from 'erxes-ui';
import { EMLayout, EMLayoutPreviousStepButton } from './EMLayout';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { EMHOURS_SCHEMA } from '@/integrations/erxes-messenger/constants/emHoursSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseTime } from '@internationalized/date';
import { EnumResponseRate } from '@/integrations/erxes-messenger/types/ResponseRate';
import { useSetAtom } from 'jotai';
import {
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { Weekday } from '@/integrations/erxes-messenger/types/Weekday';

type EMHoursAvailabilityFormValues = z.infer<typeof EMHOURS_SCHEMA>;

export const EMHoursAvailability = () => {
  const form = useForm<EMHoursAvailabilityFormValues>({
    resolver: zodResolver(EMHOURS_SCHEMA),
    defaultValues: {
      availabilityMethod: 'manual',
      isOnline: false,
      timezone: detectTimeZone(),
      responseRate: EnumResponseRate.MINUTES,
    },
  });

  const setStep = useSetAtom(erxesMessengerSetupStepAtom);

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupHoursAtom}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-auto flex flex-col overflow-hidden"
      >
        <EMLayout
          title="Hours availability"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="p-4 pt-0 space-y-6 overflow-auto styled-scroll flex-1">
            <Form.Field
              name="availabilityMethod"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">
                    Availability switch type
                  </Form.Label>
                  <Form.Control>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col !mt-0"
                    >
                      <Form.Item className="flex items-center gap-3 space-y-0">
                        <Form.Control>
                          <RadioGroup.Item value="manual" />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Turn online/offline manually
                        </Form.Label>
                      </Form.Item>
                      <Form.Item className="flex items-center gap-3 space-y-0">
                        <Form.Control>
                          <RadioGroup.Item value="auto" />
                        </Form.Control>
                        <Form.Label variant="peer">
                          Set to follow your schedule
                        </Form.Label>
                      </Form.Item>
                    </RadioGroup>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <EMHoursTimeTable form={form} />
            <Form.Field
              name="responseRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Response rate</Form.Label>
                  <Form.Control>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      {Object.values(EnumResponseRate).map((rate) => (
                        <Form.Item
                          className="flex items-center gap-3 space-y-0"
                          key={rate}
                        >
                          <Form.Control>
                            <RadioGroup.Item value={rate} />
                          </Form.Control>
                          <Form.Label variant="peer">few {rate}</Form.Label>
                        </Form.Item>
                      ))}
                    </RadioGroup>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="timezone"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Timezone</Form.Label>
                  <Form.Control>
                    <TimezoneSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      className="max-w-96"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="displayOperatorTimezone"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Display operator timezone
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Display chat operator timezone set in their location in team
                    member profiles
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="hideMessengerDuringOfflineHours"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Hide messenger during offline hours
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Forcibly hide the messenger when you're offline. This will
                    hide the messenger from your website visitors.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};

export const EMHoursTimeTable = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof EMHOURS_SCHEMA>>;
}) => {
  const availabilityMethod = useWatch({
    control: form.control,
    name: 'availabilityMethod',
  });

  if (availabilityMethod === 'manual') {
    return (
      <Form.Field
        name="isOnline"
        render={({ field }) => (
          <Form.Item>
            <div className="flex items-center gap-3">
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>

              <Form.Label variant="peer" className="leading-6">
                Visible online to visitor or customer
              </Form.Label>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  return (
    <ScrollArea className="w-full ">
      {Object.values(Weekday).map((day, index) => (
        <Form.Field
          name={`onlineHours.${day}.work`}
          key={index}
          render={({ field }) => (
            <Form.Item className="flex items-center border-b gap-3 py-3 px-1 space-y-0">
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      form.setValue(
                        `onlineHours.${day}.from`,
                        '09:00:00' as never,
                      );
                      form.setValue(
                        `onlineHours.${day}.to`,
                        '18:00:00' as never,
                      );
                    }
                  }}
                />
              </Form.Control>
              <Form.Label
                className={cn(
                  'font-semibold capitalize leading-7 min-w-20',
                  !!field.value && 'mr-auto',
                )}
                variant="peer"
              >
                {day}
              </Form.Label>

              {field.value ? (
                <div className="inline-flex gap-3 items-center text-accent-foreground text-sm">
                  <Form.Field
                    name={`onlineHours.${day}.from`}
                    render={({ field }) => (
                      <Form.Item>
                        <TimeField
                          value={field.value ? parseTime(field.value) : null}
                          onChange={(value) => {
                            field.onChange(value?.toString());
                          }}
                          aria-label={day + ' from'}
                        >
                          <Form.Control>
                            <DateInput />
                          </Form.Control>
                        </TimeField>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <span>to</span>
                  <Form.Field
                    name={`onlineHours.${day}.to`}
                    render={({ field }) => (
                      <Form.Item>
                        <TimeField
                          value={field.value ? parseTime(field.value) : null}
                          onChange={(value) => {
                            field.onChange(value?.toString());
                          }}
                          aria-label={day + ' to'}
                        >
                          <Form.Control>
                            <DateInput />
                          </Form.Control>
                        </TimeField>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              ) : (
                <Form.Label variant="peer" className="text-accent-foreground">
                  Not working on this day
                </Form.Label>
              )}
            </Form.Item>
          )}
        />
      ))}
      <ScrollArea.Bar orientation="horizontal" />
    </ScrollArea>
  );
};
