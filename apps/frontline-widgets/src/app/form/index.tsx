import { useEffect, useState } from 'react';
import { useWidgetConnect } from './hooks/useWidgetConnect';
import { InfoCard, Input, Label } from 'erxes-ui';

export const Form = () => {
  const [settings, setSettings] = useState<any>({});
  const { connectMutation, data, loading } = useWidgetConnect();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log(event.data, 'event.data');
      if (event.data.fromPublisher) {
        console.log(event.data, 'event.data.settings');
        setSettings(event.data.settings || {});
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (settings.form_id && settings.channel_id) {
      connectMutation({
        variables: {
          channelId: settings.channel_id,
          formCode: settings.form_id,
        },
      });
    }
  }, [connectMutation, settings]);

  const form = data?.widgetsLeadConnect?.form;
  console.log(form, 'form');
  return (
    <InfoCard title={form?.name}>
      <InfoCard.Content>
        <div className="grid grid-cols-2 gap-4 mb-2">
          {form?.fields.map((field: any) => (
            <div key={field._id}>
              <Label>{field.text}</Label>
              <Input />
            </div>
          ))}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
