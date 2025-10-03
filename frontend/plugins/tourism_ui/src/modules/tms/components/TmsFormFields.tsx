import { Control, useFieldArray } from 'react-hook-form';
import { Button, Form, Input, Select, Upload } from 'erxes-ui';
import { TmsFormType } from '@/tms/constants/formSchema';
import { IconUpload, IconPlus, IconTrash } from '@tabler/icons-react';

export const TourName = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Tour Name <span className="text-red-500">*</span>
          </Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const SelectColor = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="color"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Main color <span className="text-red-500">*</span>
          </Form.Label>

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
  );
};

export const LogoField = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      name="logo"
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>LOGO</Form.Label>
          <Form.Description>
            Image can be shown on the top of the post also
          </Form.Description>
          <Form.Control>
            <Upload.Root
              {...field}
              value={field.value || ''}
              onChange={(fileInfo) => {
                if ('url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
            >
              <div className="w-full">
                <Upload.Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="flex flex-col items-center justify-center w-full border border-dashed h-28 text-muted-foreground"
                >
                  <IconUpload className="mb-2" />

                  <Button variant="outline" className="text-sm font-medium">
                    Upload logo
                  </Button>

                  <p className="mt-2 text-sm text-gray-400">
                    Max size: 15MB, File type: PNG
                  </p>
                </Upload.Button>

                {field.value && (
                  <Upload.Preview className="w-full h-full mt-2" />
                )}
              </div>
            </Upload.Root>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const FavIconField = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  return (
    <Form.Field
      name="favIcon"
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>FAV ICON</Form.Label>

          <Form.Description>
            Fav icon can be shown on the top of the post also in
          </Form.Description>
          <Form.Control>
            <Upload.Root
              {...field}
              value={field.value || ''}
              onChange={(fileInfo) => {
                if ('url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
            >
              <Upload.Preview className="hidden" />
              <div className="w-full">
                <Upload.Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="flex flex-col items-center justify-center w-full border border-dashed h-28 text-muted-foreground"
                >
                  <IconUpload className="mb-2" />

                  <Button variant="outline" className="text-sm font-medium">
                    Upload favicon
                  </Button>

                  <p className="mt-2 text-sm text-gray-400">
                    Max size: 15MB, File type: PNG
                  </p>
                </Upload.Button>

                {field.value && (
                  <Upload.Preview className="w-full h-full mt-2" />
                )}
              </div>
            </Upload.Root>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

const TestGeneralManager = [
  { label: 'Bold Bold', value: '1' },
  { label: 'Bat Bat', value: '2' },
  { label: 'Toroo Toroo', value: '3' },
  { label: 'Temuulen Temuulen', value: '4' },
];

export const GeneralManeger = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="generalManeger"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>General maneger</Form.Label>
          <Form.Description>
            General maneger can be shown on the top of the post also in the list
            view
          </Form.Description>
          <Select
            onValueChange={(value) => field.onChange([value])}
            value={field.value?.[0] || ''}
          >
            <Form.Control>
              <Select.Trigger className="justify-between h-8 truncate rounded-md appearance-none w-44 text-foreground [&>span]:flex-1 [&>svg]:w-0 [&>svg]:mr-0">
                <Select.Value
                  placeholder={
                    <span className="text-sm font-medium text-center truncate text-muted-foreground">
                      {'Choose team member'}
                    </span>
                  }
                >
                  <span className="text-sm font-medium text-foreground">
                    {
                      TestGeneralManager.find(
                        (status) => status.value === field.value?.[0],
                      )?.label
                    }
                  </span>
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content
              className="border p-0 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2"
              align="start"
            >
              <Select.Group>
                {TestGeneralManager.map((status) => (
                  <Select.Item
                    key={status.value}
                    className="text-xs h-7"
                    value={status.value}
                  >
                    {status.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const TestManegers = [
  { label: 'Bold Bold', value: '1' },
  { label: 'Bat Bat', value: '2' },
  { label: 'Toroo Toroo', value: '3' },
  { label: 'Temuulen Temuulen', value: '4' },
];

export const Maneger = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="manegers"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Manegers</Form.Label>
          <Form.Description>
            Maneger can be shown on the top of the post also in the list view
          </Form.Description>
          <Select
            onValueChange={(value) => field.onChange([value])}
            value={field.value?.[0] || ''}
          >
            <Form.Control>
              <Select.Trigger className="justify-between h-8 truncate rounded-md appearance-none [&>svg]:hidden w-44 text-foreground [&>span]:flex-1 [&>svg]:w-0 [&>svg]:mr-0">
                <Select.Value
                  placeholder={
                    <span className="text-sm font-medium text-center truncate text-muted-foreground">
                      {'Choose team member'}
                    </span>
                  }
                >
                  <span className="text-sm font-medium text-foreground">
                    {
                      TestManegers.find(
                        (status) => status.value === field.value?.[0],
                      )?.label
                    }
                  </span>
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content
              className="border p-0 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2"
              align="start"
            >
              <Select.Group>
                {TestManegers.map((status) => (
                  <Select.Item
                    key={status.value}
                    className="text-xs h-7"
                    value={status.value}
                  >
                    {status.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const TestPayments = [
  { value: '1', label: 'Visa' },
  { value: '2', label: 'Qpay' },
  { value: '3', label: 'Mastercard' },
];

export const Payments = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="payment"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>PAYMENTS</Form.Label>
          <Form.Description>
            Select payments that you want to use
          </Form.Description>

          <div className="flex items-center justify-between mt-2 space-x-4">
            <Select
              onValueChange={(value) => field.onChange([value])}
              value={field.value?.[0] || ''}
            >
              <Form.Control>
                <Select.Trigger className="justify-between w-40 h-8 truncate rounded-md text-foreground appearance-none [&>span]:flex-1 [&>svg]:w-0 [&>svg]:mr-0">
                  <Select.Value
                    placeholder={
                      <span className="text-sm font-medium truncate text-muted-foreground">
                        {'Select payments'}
                      </span>
                    }
                  >
                    <span className="text-sm font-medium text-foreground">
                      {
                        TestPayments.find(
                          (status) => status.value === field.value?.[0],
                        )?.label
                      }
                    </span>
                  </Select.Value>
                </Select.Trigger>
              </Form.Control>
              <Select.Content
                className="border p-0 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2"
                align="start"
              >
                <Select.Group>
                  {TestPayments.map((status) => (
                    <Select.Item
                      key={status.value}
                      className="text-xs h-7"
                      value={status.value}
                    >
                      {status.label}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select>

            <Button variant="default" className="flex items-center h-8 gap-2">
              <IconPlus size={18} />
              Add Payment
            </Button>
          </div>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const Token = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="token"
      render={({ field }) => (
        <Form.Item className="border-y border-y-[#E4E4E7] py-4">
          <Form.Label>Erxes app token</Form.Label>
          <Form.Description>What is erxes app token ?</Form.Description>
          <Form.Control>
            <Input className="w-40 h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const OtherPayments = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  // Define Icon options
  const Icon = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'Mastercard' },
    { value: 'qpay', label: 'QPay' },
    { value: 'socialpay', label: 'SocialPay' },
  ];

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  const handleAddPayment = () => {
    append({ type: '', title: '', icon: '', config: '' });
  };

  return (
    <div>
      <div className="flex flex-col items-start self-stretch gap-2">
        <h2 className="self-stretch text-[#4F46E5] text-sm font-medium leading-tight">
          Other Payments
        </h2>

        <p className="text-[#71717A] font-['Inter'] text-xs font-medium leading-[140%]">
          Type is must latin, some default types: golomtCard, khaanCard, TDBCard
          Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
          Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
          хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр
          (Татвар тооцсон) бол: "preTax: true
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 p-3 pt-5">
        <Button
          variant="default"
          className="flex items-center gap-2 mb-6"
          onClick={handleAddPayment}
          type="button"
        >
          <IconPlus size={16} />
          Add payment method
        </Button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-end self-stretch justify-between w-full px-4 mb-4"
        >
          <div className="flex w-[100px] flex-col justify-end items-start">
            <Form.Field
              control={control}
              name={`otherPayments.${index}.type`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    TYPE
                  </Form.Label>
                  <Form.Control>
                    <Input
                      className="w-full px-0 border-0 border-b border-gray-200 rounded-none shadow-none"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <div className="flex w-[100px] flex-col justify-end items-start">
            <Form.Field
              control={control}
              name={`otherPayments.${index}.title`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    TITLE
                  </Form.Label>
                  <Form.Control>
                    <Input
                      className="w-full px-0 border-0 border-b border-gray-200 rounded-none shadow-none"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <div className="flex w-[100px] flex-col items-start">
            <Form.Field
              control={control}
              name={`otherPayments.${index}.icon`}
              render={({ field }) => (
                <Form.Item className="flex flex-col w-full">
                  <Form.Label className="text-xs text-gray-600">
                    ICON
                  </Form.Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <Form.Control>
                      <Select.Trigger className="w-full px-0 border-0 border-b border-gray-200 rounded-none shadow-none [&>span]:flex-1 [&>svg]:w-0 [&>svg]:mr-0">
                        <Select.Value placeholder="Select" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {Icon.map((icon) => (
                        <Select.Item
                          key={icon.value}
                          className="text-xs"
                          value={icon.value}
                        >
                          {icon.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Item>
              )}
            />
          </div>

          <div className="flex w-[100px] flex-col justify-end items-start">
            <Form.Field
              control={control}
              name={`otherPayments.${index}.config`}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-xs text-gray-600">
                    CONFIG
                  </Form.Label>
                  <Form.Control>
                    <Input
                      className="w-full px-0 border-0 border-b border-gray-200 rounded-none shadow-none"
                      {...field}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <Button
            variant="ghost"
            className="h-8 px-2 text-destructive"
            type="button"
            onClick={() => remove(index)}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
};
