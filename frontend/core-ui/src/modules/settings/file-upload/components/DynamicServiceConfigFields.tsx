import { AnimatePresence, motion } from 'motion/react';

import { Checkbox, Form, Input } from 'erxes-ui';

import { UPLOAD_SERVICE_DATA } from '@/settings/file-upload/constants/serviceData';
import {
  DynamicFieldsT,
  UploadConfigFormT,
} from '@/settings/file-upload/types';
import { FormProps, Path } from 'react-hook-form';

interface TField {
  label: string;
  name: string;
  type: string;
}

type Props = {
  dynamicFields: TField[];
  selected: string;
  form: FormProps<UploadConfigFormT>;
};

export function DynamicServiceConfigFields({
  dynamicFields,
  selected,
  form,
}: Props) {
  return (
    <AnimatePresence mode="popLayout">
      {dynamicFields.length > 0 && (
        <motion.div
          key={selected}
          initial={false}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col bg-background rounded-lg h-auto shadow-sm overflow-hidden mb-4"
        >
          <h4 className="font-semibold text-base p-3">
            {UPLOAD_SERVICE_DATA.find((item) => item.value === selected)?.label}
          </h4>
          <div className="grid grid-cols-4 gap-1 p-4">
            {dynamicFields.map((fieldData: TField) =>
              fieldData.type === 'checkbox' ? (
                <Form.Field
                  control={form.control}
                  name={fieldData.name as Path<UploadConfigFormT>}
                  key={fieldData.name}
                  render={({ field }: { field: any }) => (
                    <Form.Item className="col-span-4 flex items-center justify-start gap-x-2">
                      <Form.Control>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          id={fieldData.name}
                        />
                      </Form.Control>
                      <Form.Label className="text-xs">
                        {fieldData.label}
                      </Form.Label>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ) : (
                <Form.Field
                  control={form.control}
                  name={fieldData.name as keyof DynamicFieldsT}
                  key={fieldData.name}
                  render={({ field }: { field: any }) => (
                    <Form.Item
                      className={
                        selected === 'GCS' ? 'col-span-4' : 'col-span-2'
                      }
                    >
                      <Form.Label className="text-xs">
                        {fieldData.label}
                      </Form.Label>
                      <Form.Control>
                        <Input type={'text'} {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ),
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
