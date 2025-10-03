import {
  BOARD_NAMES_CONFIGS,
  BOARD_NUMBERS,
} from '@/deals/constants/pipelines';
import { Checkbox, Form, Input } from 'erxes-ui';

import Attribution from './Attribution';

const PipelineConfig = ({ form }: { form: any }) => {
  const { control } = form;

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between mb-4">
        <Form.Field
          control={control}
          name="numberConfig"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <div className="flex justify-between items-center">
                <Form.Label>Number configuration</Form.Label>
                <Attribution
                  config={BOARD_NUMBERS}
                  onChange={field.onChange}
                  value={field.value}
                />
              </div>
              <Form.Control>
                <Input {...field} placeholder="Enter number configuration" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="numberSize"
          render={({ field }) => (
            <Form.Item className="w-48">
              <Form.Label>Fractional part</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="1-8" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={control}
        name="nameConfig"
        render={({ field }) => (
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Label>Name configuration</Form.Label>
              <Attribution
                config={BOARD_NAMES_CONFIGS}
                onChange={field.onChange}
                value={field.value}
              />
            </div>
            <Form.Control>
              <Input {...field} placeholder="Enter name configuration" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckDate"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>Select the day after the card created date</Form.Label>
            <Form.Control>
              <Checkbox
                className="!mt-0"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckUser"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>Show only the user's assigned(created) deal</Form.Label>
            <Form.Control>
              <Checkbox
                className="!mt-0"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckDepartment"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>
              Show only user’s assigned (created) deal by department
            </Form.Label>
            <Form.Control>
              <Checkbox
                className="!mt-0"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

export default PipelineConfig;
