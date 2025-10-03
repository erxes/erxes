import { Control } from 'react-hook-form';
import { Button, Form, Input, Upload } from 'erxes-ui';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import Heading from '../../ui/heading';
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Appearance = ({ control }: { control: Control<PmsBranchFormType> }) => {
  return (
    <PmsFormFieldsLayout>
      <Heading>Logo and favicon</Heading>
      <div className="xl:grid grid-cols-3">
        <Form.Field
          control={control}
          name="logo"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Main logo</Form.Label>
              <Form.Description>
                Image can be shown on the top of the post also{' '}
              </Form.Description>
              <Form.Control>
                <Upload.Root {...field} value={field.value ?? ''}>
                  <Upload.Preview className="hidden" />
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className="flex flex-col gap-3 items-center justify-center w-full h-52 border border-dashed text-muted-foreground"
                  >
                    <IconUpload />
                    <Button variant={'outline'}>Upload Logo</Button>
                    <span className="text-sm font-medium">
                      Max size: 15MB, File type: PNG
                    </span>
                  </Upload.Button>
                </Upload.Root>
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      </div>

      <Heading>Main color</Heading>
      <Form.Field
        control={control}
        name="color"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Color</Form.Label>

            <Form.Control>
              <div
                className="relative w-8 h-8 overflow-hidden rounded-full"
                style={{ backgroundColor: field.value || '#4F46E5' }}
              >
                <Input
                  type="color"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  {...field}
                />
              </div>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Heading>Infos</Heading>
      <Form.Field
        control={control}
        name="website"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Website</Form.Label>

            <Form.Control>
              <Input {...field} placeholder="Website url" />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
    </PmsFormFieldsLayout>
  );
};

export default Appearance;
