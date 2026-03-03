'use client';

import { useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import {
  Button,
  Form,
  Input,
  Upload,
  ColorPicker,
  Spinner,
  readImage,
} from 'erxes-ui';
import { TmsFormType } from '@/tms/constants/formSchema';
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
                if ('url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
              className="relative group"
            >
              {isLoading ? (
                <div className="flex flex-col justify-center items-center w-full h-28 rounded-md border border-dashed bg-accent">
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
                      <div className="flex relative z-10 flex-col gap-3 justify-center items-center">
                        <IconUpload size={20} />
                        <span className="text-xs text-muted-foreground">
                          Max size: 15MB, File type: PNG
                        </span>
                      </div>
                    )}
                    {field.value && (
                      <div className="flex absolute inset-0 justify-center items-center transition-all duration-200 bg-black/0 group-hover:bg-black/20">
                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
                      className="absolute top-2 right-2 z-30 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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
          <div className="flex gap-4 justify-between items-end">
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
      <div className="flex flex-col gap-2 items-start self-stretch">
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

      <div className="flex gap-2 justify-end items-center p-3 pt-5">
        <Button
          variant="default"
          className="flex gap-2 items-center mb-6"
          onClick={handleAddPayment}
          type="button"
        >
          <IconPlus size={16} />
          Add payment method
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-6 items-end">
            <div className="grid grid-cols-3 gap-6 w-full">
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
