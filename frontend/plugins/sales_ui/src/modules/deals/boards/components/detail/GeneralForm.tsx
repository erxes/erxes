import { Combobox, Form, Input, Popover, Select } from 'erxes-ui';
import {
  SelectBoard,
  SelectBranches,
  SelectDepartments,
  SelectMember,
  SelectTags,
} from 'ui-modules';
import { useRef, useState } from 'react';

import PipelineConfig from '@/deals/pipelines/components/PipelineConfig';

import { useTranslation } from 'react-i18next';

const VISIBILITY_TYPES = [
  { value: 'public', label: 'public' },
  { value: 'private', label: 'private' },
];

const GeneralForm = ({ form }: { form: any }) => {
  const { control, watch } = form;

  const [open, setOpen] = useState(false);
  const visibility = watch('visibility');

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  const { t } = useTranslation('sales');

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Form.Field
          control={control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder={t('enter-pipeline-name')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="visibility"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('visibility')}</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger
                    className={!field.value ? 'text-muted-foreground' : ''}
                  >
                    {field.value ? t(field.value) : t('select-visibility')}
                  </Select.Trigger>
                  <Select.Content>
                    {VISIBILITY_TYPES.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {t(option.label)}
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
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('board')}</Form.Label>
              <SelectBoard.FormItem
                mode="single"
                onValueChange={field.onChange}
                value={field.value}
                className="focus-visible:relative focus-visible:z-10"
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="tagId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('tag')}</Form.Label>
              <SelectTags.Provider
                tagType="sales:deal"
                value={field.value}
                onValueChange={(tag) => {
                  field.onChange(tag);
                  setOpen(false);
                }}
              >
                <Popover open={open} onOpenChange={setOpen}>
                  <Form.Control>
                    <Combobox.Trigger ref={selectParentRef}>
                      <SelectTags.Value />
                    </Combobox.Trigger>
                  </Form.Control>
                  <Combobox.Content>
                    <SelectTags.Command disableCreateOption />
                  </Combobox.Content>
                </Popover>
              </SelectTags.Provider>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="branchIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('branches')}</Form.Label>
              <SelectBranches.FormItem
                onValueChange={field.onChange}
                value={field.value}
                mode="multiple"
                className="focus-visible:relative focus-visible:z-10"
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="departmentIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('departments')}</Form.Label>
              <SelectDepartments.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                className="focus-visible:relative focus-visible:z-10"
              />
            </Form.Item>
          )}
        />

        {visibility === 'private' && (
          <Form.Field
            name="memberIds"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('team-members')}</Form.Label>
                <SelectMember.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                  mode="multiple"
                />
              </Form.Item>
            )}
          />
        )}
      </div>
      <PipelineConfig form={form} />
    </>
  );
};

export default GeneralForm;
