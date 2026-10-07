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
import { DealChipTrigger } from '@/deals/components/deal-selects/DealChipTrigger';

/**
 * Inline chips for the deal detail field row.
 *
 * Each one wraps a shared select's Provider/Value/Content in a local trigger
 * rather than using its root component, because the roots render a chevron.
 * Multi-select chips stay open so several values can be picked in one go;
 * single-select chips close on pick.
 */

const ChipPopover = ({
  open,
  onOpenChange,
  label,
  value,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label?: React.ReactNode;
  value: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <DealChipTrigger label={label}>{value}</DealChipTrigger>
    <Combobox.Content>{children}</Combobox.Content>
  </Popover>
);

type ChipProps = {
  label?: React.ReactNode;
  value?: string[] | string;
  onValueChange: (value: string | string[]) => void;
};

export const DealAssigneeChip = ({
  label,
  value,
  onValueChange,
  placeholder,
  mode = 'multiple',
}: ChipProps & { placeholder?: string; mode?: 'single' | 'multiple' }) => {
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
        label={label}
        value={<SelectMember.Value placeholder={placeholder} />}
      >
        <SelectMember.Content />
      </ChipPopover>
    </SelectMember.Provider>
  );
};

export const DealTagsChip = ({
  label,
  value,
  onValueChange,
  showSelectedTagsOutside = true,
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
        <DealChipTrigger label={label}>
          <TagsSelect.Value placeholder={t('select-tags')} showValue />
        </DealChipTrigger>
        {showSelectedTagsOutside ? <TagsSelect.SelectedList /> : null}
        <Combobox.Content>
          <TagsSelect.Content />
        </Combobox.Content>
      </div>
    </TagsSelect.Provider>
  );
};

export const DealBranchesChip = ({
  label,
  value,
  onValueChange,
}: ChipProps) => {
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
        label={label}
        value={<SelectBranches.Value />}
      >
        <SelectBranches.Content />
      </ChipPopover>
    </SelectBranches>
  );
};

export const DealDepartmentsChip = ({
  label,
  value,
  onValueChange,
}: ChipProps) => {
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
        label={label}
        value={<SelectDepartments.Value />}
      >
        <SelectDepartments.Content />
      </ChipPopover>
    </SelectDepartments>
  );
};

export const DealStageChip = ({
  label,
  value,
  pipelineId,
  onValueChange,
}: ChipProps & { pipelineId?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectStage.Provider
      mode="single"
      value={value}
      pipelineId={pipelineId}
      onValueChange={(next, isAutoSelection) => {
        onValueChange(next);
        // The provider auto-selects the first stage on load; that must not
        // yank the popover shut while the user is choosing.
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
  label,
  value,
  onValueChange,
  placeholder,
}: ChipProps & { placeholder?: string }) => {
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
        label={label}
        value={<SelectCustomer.Value placeholder={placeholder} />}
      >
        <SelectCustomer.Content />
      </ChipPopover>
    </SelectCustomer.Provider>
  );
};

export const DealCompanyChip = ({
  label,
  value,
  onValueChange,
  placeholder,
}: ChipProps & { placeholder?: string }) => {
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
        label={label}
        value={<SelectCompany.Value placeholder={placeholder} />}
      >
        <SelectCompany.Content />
      </ChipPopover>
    </SelectCompany.Provider>
  );
};

export const DealBrokerTypeChip = ({
  label,
  value,
  options,
  onValueChange,
}: {
  label?: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <ChipPopover
      open={open}
      onOpenChange={setOpen}
      label={label}
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
