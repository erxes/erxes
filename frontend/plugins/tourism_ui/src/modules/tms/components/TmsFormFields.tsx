'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Control,
  UseFormReturn,
  useFieldArray,
  useWatch,
  useController,
} from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Upload,
  ColorPicker,
  Spinner,
  readImage,
  Combobox,
  Command,
  Popover,
  Switch,
} from 'erxes-ui';
import { TmsFormType } from '@/tms/constants/formSchema';
import { LANGUAGES } from '@/tms/constants/languages';
import { IconUpload, IconPlus, IconTrash } from '@tabler/icons-react';
import { SelectMember } from 'ui-modules';
import { SelectPayment } from '@/pms/components/payment/SelectPayment';

export interface PaymentType {
  _id: string;
  name: string;
  kind: string;
  status: string;
  config: any;
  createdAt: string;
}

export const TourName = ({ control }: { control: Control<TmsFormType> }) => {
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
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const MainLanguageSelect = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  const { field: mainLanguageField } = useController({
    control,
    name: 'mainLanguage',
  });
  const languages = useWatch({ control, name: 'language' });
  const mainLanguage = useWatch({ control, name: 'mainLanguage' });
  const options = useMemo(
    () =>
      Array.isArray(languages)
        ? languages.filter((item): item is string => typeof item === 'string')
        : [],
    [languages],
  );

  useEffect(() => {
    if (!options.length) {
      if (mainLanguage) {
        mainLanguageField.onChange('');
      }
      return;
    }

    if (!mainLanguage || !options.includes(mainLanguage)) {
      mainLanguageField.onChange(options[0]);
    }
  }, [mainLanguage, options, mainLanguageField]);

  return (
    <Form.Field
      control={control}
      name="mainLanguage"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Main language</Form.Label>
          <Form.Control>
            <MainLanguageSelectFormItem
              value={field.value}
              options={options}
              onValueChange={field.onChange}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const MainLanguageSelectFormItem = ({
  value,
  onValueChange,
  options,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  options: string[];
}) => {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((language) => language.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full shadow-xs">
        <Combobox.Value
          placeholder="Select main language"
          value={selected?.label}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search languages..." />
          <Command.List className="max-h-[300px] overflow-y-auto">
            <Command.Empty>No language found</Command.Empty>
            {LANGUAGES.filter((language) =>
              options.includes(language.value),
            ).map((language) => (
              <Command.Item
                key={language.value}
                value={`${language.value}|${language.label}`}
                onSelect={() => {
                  onValueChange(language.value);
                  setOpen(false);
                }}
              >
                {language.label}
                <Combobox.Check checked={value === language.value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
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
            Main color <span className="text-destructive">*</span>
          </Form.Label>

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

const ImageUploadField = ({
  control,
  name,
  label,
  description,
}: {
  control: Control<TmsFormType>;
  name: 'logo' | 'favIcon';
  label: string;
  description: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Description>{description}</Form.Description>
          <Form.Control>
            <Upload.Root
              {...field}
              value={field.value || ''}
              onChange={(fileInfo) => {
                if (
                  typeof fileInfo === 'object' &&
                  fileInfo !== null &&
                  'url' in fileInfo
                ) {
                  field.onChange(fileInfo.url);
                } else {
                  field.onChange('');
                }
              }}
              className="relative group"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center w-full border border-dashed rounded-md h-28 bg-accent">
                  <Spinner className="text-muted-foreground" size="md" />
                </div>
              ) : (
                <>
                  <Upload.Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    className={`flex overflow-hidden relative flex-col justify-center items-center w-full h-28 rounded-md border border-border text-muted-foreground group bg-background ${
                      field.value ? '' : 'border-dashed'
                    }`}
                    style={
                      field.value
                        ? {
                            backgroundImage: `url(${readImage(field.value)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }
                        : {}
                    }
                  >
                    {!field.value && (
                      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                        <IconUpload size={20} />
                        <span className="text-xs text-muted-foreground">
                          Max size: 15MB, File type: PNG
                        </span>
                      </div>
                    )}
                    {field.value && (
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                          <div className="px-2 py-1 text-xs font-medium text-black rounded-lg backdrop-blur-sm bg-white/90">
                            Change
                          </div>
                        </div>
                      </div>
                    )}
                  </Upload.Button>

                  {field.value && (
                    <Upload.RemoveButton
                      size="sm"
                      variant="destructive"
                      disabled={isRemoving}
                      className="absolute z-30 transition-opacity duration-200 shadow-lg opacity-0 top-2 right-2 group-hover:opacity-100"
                      onClick={() => {
                        setIsRemoving(true);
                        field.onChange('');
                        setIsRemoving(false);
                      }}
                    >
                      {isRemoving ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        <IconTrash size={14} />
                      )}
                    </Upload.RemoveButton>
                  )}

                  <div className="hidden">
                    <Upload.Preview
                      onUploadStart={() => setIsLoading(true)}
                      onAllUploadsComplete={() => setIsLoading(false)}
                    />
                  </div>
                </>
              )}
            </Upload.Root>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const LogoField = ({ control }: { control: Control<TmsFormType> }) => (
  <ImageUploadField
    control={control}
    name="logo"
    label="LOGO"
    description="Image can be shown on the top of the post also"
  />
);

export const FavIconField = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => (
  <ImageUploadField
    control={control}
    name="favIcon"
    label="FAV ICON"
    description="Fav icon can be shown on the top of the post also in"
  />
);

export const GeneralManager = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="generalManager"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            General Managers <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Description>
            General manager can be shown on the top of the post also in the list
            view
          </Form.Description>
          <Form.Control>
            <div className="w-full">
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const Manager = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="managers"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Managers</Form.Label>
          <Form.Description>
            Manager can be shown on the top of the post also in the list view
          </Form.Description>
          <Form.Control>
            <div className="w-full">
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const LanguageSelectFormItem = ({
  value = [],
  onValueChange,
}: {
  value?: string[];
  onValueChange: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabels = value
    .map((code) => LANGUAGES.find((language) => language.value === code)?.label)
    .filter(Boolean);

  const toggleLanguage = (code: string) => {
    const nextValue = value.includes(code)
      ? value.filter((item) => item !== code)
      : [...value, code];

    onValueChange(nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full shadow-xs">
        <Combobox.Value
          placeholder="Select languages"
          value={selectedLabels.length ? selectedLabels.join(', ') : undefined}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search languages..." />
          <Command.List className="max-h-[300px] overflow-y-auto">
            <Command.Empty>No language found</Command.Empty>
            {LANGUAGES.map((language) => (
              <Command.Item
                key={language.value}
                value={`${language.value}|${language.label}`}
                onSelect={() => toggleLanguage(language.value)}
              >
                {language.label}
                <Combobox.Check checked={value.includes(language.value)} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const LanguageSelect = ({
  control,
}: {
  control: Control<TmsFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="language"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Language</Form.Label>
          <Form.Control>
            <LanguageSelectFormItem
              value={
                Array.isArray(field.value)
                  ? field.value.filter(
                      (item): item is string => typeof item === 'string',
                    )
                  : []
              }
              onValueChange={field.onChange}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

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
          <div className="flex items-end justify-between gap-4">
            <Form.Control className="flex-1">
              <SelectPayment.FormItem
                mode="multiple"
                value={field.value || []}
                onValueChange={(value) => {
                  field.onChange(Array.isArray(value) ? value : []);
                }}
                placeholder="Select payments"
              />
            </Form.Control>
          </div>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const Prepaid = ({ form }: { form: UseFormReturn<TmsFormType> }) => {
  const prepaidEnabled = useWatch({
    control: form.control,
    name: 'prepaid',
  });

  return (
    <div className="py-3 border-y">
      <Form.Field
        control={form.control}
        name="prepaid"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Form.Label className="cursor-pointer">Prepaid</Form.Label>
              <Form.Description>Enable prepaid percentage</Form.Description>
            </div>
            <Form.Control>
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => {
                  field.onChange(checked);

                  if (!checked) {
                    form.setValue('prepaidPercent', undefined, {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                    form.clearErrors('prepaidPercent');
                  }
                }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      {prepaidEnabled && (
        <Form.Field
          control={form.control}
          name="prepaidPercent"
          render={({ field }) => (
            <Form.Item className="mt-4">
              <Form.Label>Prepaid Percent</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="Enter prepaid percent"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const nextValue = event.target.value;

                    if (nextValue === '') {
                      field.onChange(undefined);
                      return;
                    }

                    const parsedValue = Number(nextValue);

                    if (Number.isNaN(parsedValue)) {
                      field.onChange(undefined);
                      return;
                    }

                    field.onChange(Math.min(100, Math.max(0, parsedValue)));
                  }}
                />
              </Form.Control>
              <Form.Message className="text-destructive" />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};

export const Token = ({ control }: { control: Control<TmsFormType> }) => {
  return (
    <Form.Field
      control={control}
      name="token"
      render={({ field }) => (
        <Form.Item className="py-3 border-y">
          <Form.Label>Erxes app token</Form.Label>
          <Form.Description>What is erxes app token ?</Form.Description>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  const handleAddPayment = () => {
    append({ type: '', title: '', config: '' });
  };

  return (
    <div className="py-3">
      <div className="flex flex-col items-start self-stretch gap-2">
        <h2 className="self-stretch text-sm font-medium leading-tight text-primary">
          Other Payments
        </h2>

        <p className="text-muted-foreground font-['Inter'] text-xs font-medium leading-[140%]">
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

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-6">
            <div className="grid w-full grid-cols-3 gap-6">
              <Form.Field
                control={control}
                name={`otherPayments.${index}.type`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Type</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name={`otherPayments.${index}.title`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Title</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name={`otherPayments.${index}.config`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Config</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </div>

            <Button
              variant="destructive"
              size="icon"
              type="button"
              aria-label="Remove payment method"
              className="w-8 h-8"
              onClick={() => remove(index)}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
