import { useState } from 'react';
import { Combobox, Command, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
  SelectStage,
  TagsSelect,
} from 'ui-modules';

const ChipPopover = ({
  open,
  onOpenChange,
  label,
  value,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: string;
  value: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <Combobox.ChipTrigger label={label}>{value}</Combobox.ChipTrigger>
    <Combobox.Content>{children}</Combobox.Content>
  </Popover>
);

type ChipProps = {
  value?: string[] | string;
  onValueChange: (value: string | string[]) => void;
  label?: string;
};

export const DealAssigneeChip = ({
  value,
  onValueChange,
  placeholder,
  mode = 'multiple',
  label,
}: ChipProps & { placeholder?: string; mode?: 'single' | 'multiple' }) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  return (
    <SelectMember.Provider
      value={value}
      mode={mode}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
        if (mode === 'single') setOpen(false);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label || t('assigned-to')}
        value={<SelectMember.Value placeholder={placeholder} />}
      >
        <SelectMember.Content />
      </ChipPopover>
    </SelectMember.Provider>
  );
};

export const DealTagsChip = ({
  value,
  onValueChange,
  showSelectedTagsOutside = true,
  label,
}: ChipProps & { showSelectedTagsOutside?: boolean }) => {
  const { t } = useTranslation('sales');
  let tagIds: string[] = [];

  if (Array.isArray(value)) {
    tagIds = value;
  } else if (value) {
    tagIds = [value];
  }

  return (
    <TagsSelect.Provider
      value={tagIds}
      mode="multiple"
      type="sales:deal"
      onValueChange={onValueChange}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Combobox.ChipTrigger label={label || t('tags')}>
          <TagsSelect.Value placeholder={t('select-tags')} showValue />
        </Combobox.ChipTrigger>
        {showSelectedTagsOutside ? <TagsSelect.SelectedList /> : null}
        <Combobox.Content>
          <TagsSelect.Content />
        </Combobox.Content>
      </div>
    </TagsSelect.Provider>
  );
};

export const DealBranchesChip = ({
  value,
  onValueChange,
  label,
}: ChipProps) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  return (
    <SelectBranches
      mode="multiple"
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label || t('branch')}
        value={<SelectBranches.Value />}
      >
        <SelectBranches.Content />
      </ChipPopover>
    </SelectBranches>
  );
};

export const DealDepartmentsChip = ({
  value,
  onValueChange,
  label,
}: ChipProps) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  return (
    <SelectDepartments
      mode="multiple"
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label || t('department')}
        value={<SelectDepartments.Value />}
      >
        <SelectDepartments.Content />
      </ChipPopover>
    </SelectDepartments>
  );
};

export const DealStageChip = ({
  value,
  pipelineId,
  onValueChange,
  label,
}: ChipProps & { pipelineId?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStage.Provider
      mode="single"
      value={value}
      pipelineId={pipelineId}
      onValueChange={(next, isAutoSelection) => {
        onValueChange(next);
        if (!isAutoSelection) setOpen(false);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label}
        value={<SelectStage.Value />}
      >
        <SelectStage.Content />
      </ChipPopover>
    </SelectStage.Provider>
  );
};

export const DealCustomerChip = ({
  value,
  onValueChange,
  placeholder,
  label,
}: ChipProps & { placeholder?: string }) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  return (
    <SelectCustomer.Provider
      mode="single"
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
        setOpen(false);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label || t('customer')}
        value={<SelectCustomer.Value placeholder={placeholder} />}
      >
        <SelectCustomer.Content />
      </ChipPopover>
    </SelectCustomer.Provider>
  );
};

export const DealCompanyChip = ({
  value,
  onValueChange,
  placeholder,
  label,
}: ChipProps & { placeholder?: string }) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);

  return (
    <SelectCompany.Provider
      mode="single"
      value={value}
      onValueChange={(next) => {
        if (next == null) return;
        onValueChange(next);
        setOpen(false);
      }}
    >
      <ChipPopover
        open={open}
        onOpenChange={setOpen}
        label={label || t('company')}
        value={<SelectCompany.Value placeholder={placeholder} />}
      >
        <SelectCompany.Content />
      </ChipPopover>
    </SelectCompany.Provider>
  );
};

export const DealBrokerTypeChip = ({
  value,
  options,
  label,
  onValueChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  label?: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <ChipPopover
      open={open}
      onOpenChange={setOpen}
      label={label || t('broker')}
      value={<Combobox.Value value={selected?.label} className="inline" />}
    >
      <Command>
        <Command.List>
          {options.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                onValueChange(option.value);
                setOpen(false);
              }}
            >
              <span className="flex-1">{option.label}</span>
              <Combobox.Check checked={option.value === value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </ChipPopover>
  );
};
