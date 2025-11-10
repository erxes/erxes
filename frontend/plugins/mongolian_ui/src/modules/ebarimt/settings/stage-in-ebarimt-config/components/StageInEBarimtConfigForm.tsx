import { Button, Form, Input, Select, Textarea } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IconTrash } from '@tabler/icons-react';
import { FILE_SYSTEM_TYPES } from '../constants/stageInEbarimtData';

const DEFAULT_VALUES = {
  title: '',
  posNo: '',
  destinationStageBoard: '',
  pipeline: '',
  stage: '',
  companyRD: '',
  merchantTin: '',
  branchOfProvice: '',
  subProvice: '',
  districtCode: '',
  companyName: '',
  defaultUnitedCode: '',
  headerText: '',
  branchNo: '',
};

export const StageInEBarimtConfigForm = () => {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <Form {...form}>
      <form className="h-full w-full mx-auto max-w-6xl px-9 py-5 flex flex-col gap-8">
        <h1 className="text-lg font-semibold">Stage In Ebarimt configs</h1>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            name="title"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            name="posNo"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Pos No</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="destinationStageBoard"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Destination Stage Board</Form.Label>
                <Form.Control>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <Select.Trigger>
                      <Select.Value placeholder={'-'} />
                    </Select.Trigger>
                    <Select.Content>
                      {FILE_SYSTEM_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>
                          {type.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="companyRD"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Company RD</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="pipeline"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Pipeline</Form.Label>
                <Form.Control>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <Select.Trigger>
                      <Select.Value placeholder={'-'} />
                    </Select.Trigger>
                    <Select.Content>
                      {FILE_SYSTEM_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>
                          {type.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="merchantTin"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>MerchantTin</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="stage"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Stage</Form.Label>
                <Form.Control>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <Select.Trigger>
                      <Select.Value placeholder={'-'} />
                    </Select.Trigger>
                    <Select.Content>
                      {FILE_SYSTEM_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>
                          {type.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="grid grid-cols-3 gap-4">
            <Form.Field
              control={form.control}
              name="branchOfProvice"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Branch of Provice</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'-'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="subProvice"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>SUB Provice / District</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'-'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="districtCode"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>District Code</Form.Label>
                  <Form.Message />
                  <Form.Control>
                    <Input
                      type="text"
                      placeholder="Enter company name"
                      className="h-8"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            name="companyName"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Company Name</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Field
            name="defaultUnitedCode"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Default United Code</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            name="headerText"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Header text</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Textarea
                    placeholder="Enter company name"
                    className="min-h-[80px]"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Field
            name="branchNo"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Branch No</Form.Label>
                <Form.Message />
                <Form.Control>
                  <Input
                    type="text"
                    placeholder="Enter company name"
                    className="h-8"
                    {...field}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
        <div className="text-right flex items-center justify-end gap-2">
          <Button variant="ghost" className="justify-self-end">
            <IconTrash className="size-4 text-destructive" />
            Delete
          </Button>
          <Button className="justify-self-end flex-none" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
