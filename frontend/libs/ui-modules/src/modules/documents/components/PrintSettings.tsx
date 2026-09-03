import {
  Accordion,
  Button,
  Checkbox,
  Form,
  Input,
  Select,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { ReactNode, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectDocument } from 'ui-modules/modules/documents/components/SelectDocument';
import {
  PAPER_SIZES,
  PAPER_TYPES,
} from 'ui-modules/modules/documents/constants';
import { useQzPrinters } from 'ui-modules/modules/documents/hooks/useQzPrinters';
import {
  directPrintEnabledState,
  directPrinterState,
} from 'ui-modules/modules/documents/states/printSettings';
import { PrintFormValues } from 'ui-modules/modules/documents/types/print';
import {
  SelectBranches,
  SelectDepartments,
} from 'ui-modules/modules/structure';

const Section = ({
  value,
  label,
  summary,
  children,
}: {
  value: string;
  label: string;
  summary: string;
  children: ReactNode;
}) => (
  <Accordion.Item className="py-0 border-b-0" value={value}>
    <Accordion.Trigger className="flex flex-1 items-center justify-between py-0 text-left font-normal leading-6 transition-all [&[data-state=open]>svg]:rotate-180 hover:no-underline">
      <div className="flex flex-col gap-2">
        <Form.Label>{label}</Form.Label>
        <Form.Description className="leading-5">{summary}</Form.Description>
      </div>
    </Accordion.Trigger>
    <Accordion.Content className="flex flex-col py-3 gap-3">
      {children}
    </Accordion.Content>
  </Accordion.Item>
);

const MillimetreField = ({
  name,
  label,
  placeholder,
}: {
  name: 'width' | 'height';
  label: string;
  placeholder: string;
}) => (
  <Form.Field
    name={name}
    render={({ field }) => (
      <Form.Item className="flex-1">
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input
            {...field}
            value={(field.value as number) || ''}
            type="number"
            min={0}
            max={1000}
            placeholder={placeholder}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const PrintSettings = ({
  contentType,
  initialDocumentName,
}: {
  contentType: string;
  initialDocumentName?: string;
}) => {
  const form = useFormContext<PrintFormValues>();

  const [documentName, setDocumentName] = useState(initialDocumentName || '');

  const [directPrint, setDirectPrint] = useAtom(directPrintEnabledState);
  const [printer, setPrinter] = useAtom(directPrinterState);

  const { printers, loading, connected, refresh } = useQzPrinters(directPrint);

  const { size, width, height, margin, scale, copies } = form.watch();

  const paperType = PAPER_SIZES[size]?.type || PAPER_TYPES.SHEET;

  const isRoll = paperType === PAPER_TYPES.ROLL;
  const isSheet = paperType === PAPER_TYPES.SHEET;
  const isCustom = size === 'CUSTOM';

  const sizeSummary = isRoll || isCustom
    ? `${width} × ${height || 'auto'} mm`
    : PAPER_SIZES[size]?.label || size;

  const layoutSummary = [
    sizeSummary,
    `${margin} mm margin`,
    isSheet ? `${scale}% scale` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Form {...form}>
      <form className="grid gap-5 px-5 py-3">
        <Accordion
          type="multiple"
          className="w-full flex flex-col gap-5"
          defaultValue={['reference']}
        >
          <Section
            value="reference"
            label="Reference"
            summary={documentName || 'No document selected'}
          >
            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control>
                    <SelectBrand.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
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
                      onValueChange={field.onChange}
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
                      onValueChange={field.onChange}
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
                        field.onChange(value);
                        setDocumentName(meta?.name || '');
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </Section>

          <Section value="layout" label="Layout" summary={layoutSummary}>
            <Form.Field
              name="size"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Paper</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={(value) => {
                        const preset = PAPER_SIZES[value];

                        if (preset) {
                          form.setValue('width', preset.width);
                          form.setValue('height', preset.height);
                          form.setValue('margin', preset.margin);
                        }

                        field.onChange(value);
                      }}
                    >
                      <div className="bg-white">
                        <Select.Trigger>
                          <Select.Value placeholder="Select paper size" />
                        </Select.Trigger>
                        <Select.Content>
                          {Object.entries(PAPER_SIZES).map(
                            ([key, { label }]) => (
                              <Select.Item key={key} value={key}>
                                {label}
                              </Select.Item>
                            ),
                          )}
                          <Select.Item value="CUSTOM">Custom size</Select.Item>
                        </Select.Content>
                      </div>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {(isRoll || isCustom) && (
              <div className="flex gap-3">
                <MillimetreField
                  name="width"
                  label="Width (mm)"
                  placeholder="Width (mm)"
                />
                <MillimetreField
                  name="height"
                  label="Height (mm)"
                  placeholder={isRoll ? 'Auto' : 'Height (mm)'}
                />
              </div>
            )}

            {isSheet && (
              <Form.Field
                name="scale"
                rules={{
                  min: { value: 50, message: 'Scale must be between 50 and 150' },
                  max: { value: 150, message: 'Scale must be between 50 and 150' },
                }}
                render={({ field, fieldState }) => (
                  <Form.Item>
                    <Form.Label>Scale (%)</Form.Label>
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
            )}

            <Form.Field
              name="orientation"
              render={({ field }) => (
                <div
                  className={`flex items-center gap-2 justify-end ${
                    isRoll ? 'hidden' : ''
                  }`}
                >
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
          </Section>

          <Section
            value="copies"
            label="Copies"
            summary={`${copies} ${Number(copies) === 1 ? 'copy' : 'copies'}`}
          >
            <Form.Field
              name="copies"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Copies</Form.Label>
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
          </Section>

          <Section
            value="printer"
            label="Printer"
            summary={
              directPrint
                ? printer || 'No printer selected'
                : 'Browser print dialog'
            }
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={directPrint}
                onCheckedChange={(checked) => setDirectPrint(checked === true)}
              />
              <Form.Label>Print directly, skip the browser dialog</Form.Label>
            </div>

            {directPrint && (
              <>
                <Select value={printer} onValueChange={setPrinter}>
                  <div className="bg-white">
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          loading ? 'Loading printers' : 'Select printer'
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {printers.map((name) => (
                        <Select.Item key={name} value={name}>
                          {name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </div>
                </Select>

                <div className="flex items-start justify-between gap-3">
                  <Form.Description className="leading-5">
                    {connected
                      ? "QZ Tray connected. Jobs use this printer's settings from your computer, so set the paper size and orientation in its printer preferences."
                      : 'QZ Tray not detected. Printing falls back to the browser dialog.'}
                  </Form.Description>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => refresh()}
                  >
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </Section>
        </Accordion>
      </form>
    </Form>
  );
};
