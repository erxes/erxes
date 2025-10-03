import { motion } from 'motion/react';

import { Form, RadioGroup, cn } from 'erxes-ui';

import { UPLOAD_SERVICE_DATA } from '@/settings/file-upload/constants/serviceData';
import { FormProps } from 'react-hook-form';
import { UploadConfigFormT } from '@/settings/file-upload/types';

interface Props {
  form: FormProps<UploadConfigFormT>;
  selected: string;
}

export function UploadServiceRadioGroup({ form, selected }: Props) {
  return (
    <div>
      <Form.Field
        control={form.control}
        name="UPLOAD_SERVICE_TYPE"
        key={'UPLOAD_SERVICE_TYPE'}
        render={({ field }) => (
          <RadioGroup
            role="tablist"
            className="grid-cols-3"
            defaultValue={field.value}
            onValueChange={field.onChange}
          >
            {UPLOAD_SERVICE_DATA &&
              UPLOAD_SERVICE_DATA.map((config, idx) => (
                <motion.label
                  key={idx}
                  tabIndex={0}
                  whileTap={{ scale: 0.975 }}
                  className="relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border hover:bg-accent px-2 py-3 text-center shadow-sm shadow-black/5 outline-offset-2 transition-colors has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-primary/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70"
                >
                  <RadioGroup.Item
                    id={config.value}
                    value={config.value}
                    checked={config.value.toLocaleUpperCase() === selected}
                    className="sr-only after:absolute after:inset-0"
                  />
                  <config.icon className={cn('stroke-primary')} />
                  <span>{config.label}</span>
                </motion.label>
              ))}
          </RadioGroup>
        )}
      />
    </div>
  );
}
