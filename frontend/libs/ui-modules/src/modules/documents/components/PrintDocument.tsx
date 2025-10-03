import { useQuery } from '@apollo/client';
import { IconPrinter } from '@tabler/icons-react';
import {
  Accordion,
  Button,
  Checkbox,
  Form,
  Input,
  Resizable,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectDocument } from 'ui-modules/modules/documents';
import { PAPER_SIZES } from 'ui-modules/modules/documents/constants';
import { PROCESS_DOCUMENT } from 'ui-modules/modules/documents/graphql/queries';
import * as utils from 'ui-modules/modules/documents/utils';
import {
  SelectBranches,
  SelectDepartments,
} from 'ui-modules/modules/structure';
import { useDebounce } from 'use-debounce';

const Preview = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { watch, trigger } = useFormContext();

  const { _id, replacerIds, copies, size, orientation, scale, margin } =
    watch();

  const [config, setConfig] = useState({
    margin: 15,
    scale: 100,
  });

  const { width, height } = utils.paper(size, orientation);

  const {
    data: { documentsProcess: document } = {},
    loading,
    error,
  } = useQuery(PROCESS_DOCUMENT, {
    variables: {
      _id: _id,
      replacerIds: replacerIds,
      config: {
        copies: Number(copies),
        width,
        height,
      },
    },
    skip: !_id,
  });

  const [debouncedConfig] = useDebounce(config, 500);

  useEffect(() => {
    const validate = async () => {
      const valid = await trigger(['scale', 'margin']);

      if (!valid) return;

      setConfig({
        scale: scale,
        margin: margin,
      });
    };

    validate();
  }, [scale, margin, trigger]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !document) return;

    utils.layout(document, { size, orientation, ...debouncedConfig }, iframe);

    const container = iframe.contentDocument?.querySelector('.scaled-content');

    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        const rect = (container as HTMLElement).getBoundingClientRect();

        iframe.style.height = `${Math.ceil(rect.height)}px`;
      });
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [document, size, orientation, debouncedConfig]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Can't process this document at the moment</div>;
  }

  return (
    <div
      id="print-preview"
      className="relative flex-1 flex items-center justify-center bg-gray-100"
    >
      <div
        className="relative bg-white shadow-xl transition-all duration-500 ease-in-out"
        style={{ width: `${width}mm`, minHeight: `${height}mm` }}
      >
        <iframe
          ref={iframeRef}
          title="Print Preview"
          className="w-full h-full border-0"
          style={{ minHeight: `${height}mm` }}
          scrolling="no"
        />
      </div>
    </div>
  );
};

const Controller = ({ contentType }: { contentType: string }) => {
  const form = useFormContext();

  const [items, setItems] = useState<string[]>(['three']);
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({});

  const renderDescription = (item: string, keys: string[], showAll = true) => {
    const values = form.getValues();

    if (items.includes(item)) {
      return null;
    }

    const strings: string[] = [];

    for (const key of keys) {
      const [name, replacer] = key.split(':');

      const keyName = replacer || name;

      const value = values[name as keyof typeof values];

      const selectedValue =
        selectedValues[value as keyof typeof selectedValues] || value;

      if (selectedValue) {
        if (replacer === 'value') {
          strings.push(selectedValue);
        } else {
          strings.push(`${selectedValue} ${showAll ? keyName : ''}`);
        }
      }
    }

    return strings.length ? strings.join(' • ') : 'none';
  };

  return (
    <Form {...form}>
      <form className="grid gap-5 px-5 py-3">
        <Accordion
          type="multiple"
          className="w-full flex flex-col gap-5"
          defaultValue={['three']}
          onValueChange={(value) => setItems(value)}
        >
          <Accordion.Item className="py-0 border-b-0" value="one">
            <Accordion.Trigger className="flex flex-1 items-center justify-between py-0 text-left font-normal leading-6 transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline">
              <div className="flex flex-col gap-2">
                <Form.Label>Copies & Width</Form.Label>
                <Form.Description className="leading-5 capitalize">
                  {renderDescription('one', ['copies', 'width'])}
                </Form.Description>
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="flex flex-col py-3 gap-3">
              <Form.Field
                name="copies"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{field.name}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value as number}
                        min={1}
                        type="number"
                        placeholder="Copies"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="width"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{field.name}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value as number}
                        type="number"
                        min={100}
                        max={1200}
                        placeholder="Width"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item className="py-0 border-b-0" value="two">
            <Accordion.Trigger className="flex flex-1 items-center justify-between py-0 text-left font-normal leading-6 transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline">
              <div className="flex flex-col gap-2">
                <Form.Label>Layout</Form.Label>
                <Form.Description className="leading-5 capitalize">
                  {renderDescription('two', [
                    'size:paper',
                    'margin',
                    'scale',
                    'orientation:value',
                  ])}
                </Form.Description>
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="flex flex-col py-3 gap-3">
              <Form.Field
                name="size"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{field.name}</Form.Label>
                    <Form.Control>
                      <Select
                        {...field}
                        onValueChange={(value) => {
                          form.setValue(
                            'width',
                            PAPER_SIZES[value as keyof typeof PAPER_SIZES]
                              .width,
                          );

                          field.onChange(value);
                        }}
                      >
                        <div className="bg-white">
                          <Select.Trigger>
                            <Select.Value placeholder="Select paper size" />
                          </Select.Trigger>
                          <Select.Content>
                            {Object.keys(PAPER_SIZES).map((key) => (
                              <Select.Item key={key} value={key}>
                                {key}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </div>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="margin"
                rules={{
                  min: {
                    value: 0,
                    message: 'Margin amount must be number between 0 and 50',
                  },
                  max: {
                    value: 50,
                    message: 'Margin amount must be number between 0 and 50',
                  },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label>{field.name}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value as number}
                        min={0}
                        max={50}
                        type="number"
                        placeholder="Margin"
                      />
                    </Form.Control>
                    {fieldState.error && (
                      <Form.Message>{fieldState.error.message}</Form.Message>
                    )}
                  </Form.Item>
                )}
              />
              <Form.Field
                name="scale"
                rules={{
                  min: {
                    value: 50,
                    message: 'Scale amount must be number between 50 and 150',
                  },
                  max: {
                    value: 150,
                    message: 'Scale amount must be number between 50 and 150',
                  },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label>{field.name}</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        value={field.value as number}
                        min={50}
                        max={150}
                        type="number"
                        placeholder="Scale"
                      />
                    </Form.Control>
                    {fieldState.error && (
                      <Form.Message>{fieldState.error.message}</Form.Message>
                    )}
                  </Form.Item>
                )}
              />
              <Form.Field
                name="orientation"
                render={({ field }) => (
                  <div className="flex items-center gap-2 justify-end">
                    <Form.Item className="flex items-center gap-2 space-y-0">
                      <Form.Control>
                        <Checkbox
                          checked={field.value === 'portrait'}
                          onCheckedChange={() => field.onChange('portrait')}
                        />
                      </Form.Control>
                      <Form.Label>Portrait</Form.Label>
                    </Form.Item>

                    <Form.Item className="flex items-center gap-2 space-y-0">
                      <Form.Control>
                        <Checkbox
                          checked={field.value === 'landscape'}
                          onCheckedChange={() => field.onChange('landscape')}
                        />
                      </Form.Control>
                      <Form.Label>Landscape</Form.Label>
                    </Form.Item>
                  </div>
                )}
              />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item className="py-0 border-b-0" value="three">
            <Accordion.Trigger className="flex flex-1 items-center justify-between py-0 text-left font-normal leading-6 transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline">
              <div className="flex flex-col gap-2">
                <Form.Label>Reference</Form.Label>
                <Form.Description className="leading-5 capitalize">
                  {renderDescription(
                    'three',
                    ['brandId', 'branchId', 'departmentId', '_id'],
                    false,
                  )}
                </Form.Description>
              </div>
            </Accordion.Trigger>
            <Accordion.Content className="flex flex-col py-3 gap-3">
              <Form.Field
                name="brandId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Brand</Form.Label>
                    <Form.Control>
                      <SelectBrand.FormItem
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="branchId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Branch</Form.Label>
                    <Form.Control>
                      <SelectBranches.FormItem
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="departmentId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Department</Form.Label>
                    <Form.Control>
                      <SelectDepartments.FormItem
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="_id"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Document</Form.Label>
                    <Form.Control>
                      <SelectDocument.FormItem
                        contentType={contentType}
                        value={field.value}
                        onValueChange={(value, meta) => {
                          const { _id, name } = meta || {};

                          field.onChange(value);

                          setSelectedValues((prevValues) => ({
                            ...prevValues,
                            [_id]: name,
                          }));
                        }}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </form>
    </Form>
  );
};

type Props = {
  items: any[];
  contentType: string;
};

const PrintSheetHeader = () => (
  <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <Sheet.Title>Print</Sheet.Title>
    <Sheet.Close />
  </Sheet.Header>
);

interface PrintSheetProps extends React.ComponentProps<typeof Sheet> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}

export const PrintSheet = ({
  children,
  disabled = false,
  className,
  onDiscard,
  onSave,
  ...props
}: PrintSheetProps) => {
  return (
    <Sheet {...props}>
      <Sheet.Trigger asChild>
        <Button variant="secondary" className="text-primary">
          <IconPrinter />
          Print
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-none md:w-[calc(100vw-theme(spacing.4))] flex gap-0 flex-col m-0 p-0">
        <PrintSheetHeader />

        {children}
      </Sheet.View>
    </Sheet>
  );
};

export const PrintDocument = (props: Props) => {
  const { items, contentType } = props;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      copies: 1,
      width: PAPER_SIZES.A4.width,
      orientation: 'portrait',
      margin: 15,
      scale: 100,
      size: 'A4',
      brandId: '',
      branchId: '',
      departmentId: '',
      _id: '',
      replacerIds: [],
    },
  });

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const replacerIds: any = items.map((item) => item._id);

    form.setValue('replacerIds', replacerIds);
  }, [form, items]);

  const handleDiscard = () => {
    form.reset();

    setOpen(false);
  };

  const handleProceed = () => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe');

    if (!iframe) return;

    const printIframe = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      printIframe();
    } else {
      const onLoad = () => {
        printIframe();
        iframe.removeEventListener('load', onLoad);
      };
      iframe.addEventListener('load', onLoad);
    }
  };

  return (
    <FormProvider {...form}>
      <PrintSheet
        open={open}
        onOpenChange={setOpen}
        onDiscard={handleDiscard}
        onSave={handleProceed}
      >
        <Resizable.PanelGroup direction="horizontal">
          <Resizable.Panel
            className="h-full flex flex-col bg-gray-100 !overflow-auto styled-scroll"
            minSize={40}
            defaultSize={80}
          >
            <Preview />
          </Resizable.Panel>
          <Resizable.Handle />
          <Resizable.Panel
            className="h-full flex flex-col"
            minSize={20}
            defaultSize={25}
            maxSize={25}
          >
            <div className="flex flex-col h-full relative">
              <div className="overflow-y-auto styled-scroll mb-16">
                <Controller contentType={contentType} />
              </div>
              <Sheet.Footer className="absolute bottom-0 right-0 p-5">
                <Button
                  onClick={() => {
                    handleDiscard();
                  }}
                  variant="secondary"
                >
                  Discard
                </Button>
                <Button
                  onClick={() => {
                    handleProceed();
                  }}
                >
                  Print
                </Button>
              </Sheet.Footer>
            </div>
          </Resizable.Panel>
        </Resizable.PanelGroup>
      </PrintSheet>
    </FormProvider>
  );
};
