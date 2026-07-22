import { useState } from 'react';
import { Combobox, Command, Popover } from 'erxes-ui';
import {
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
  SelectStage,
  SelectTags,
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
  value,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <DealChipTrigger>{value}</DealChipTrigger>
    <Combobox.Content>{children}</Combobox.Content>
  </Popover>
);

type ChipProps = {
  value?: string[] | string;
  onValueChange: (value: string | string[]) => void;
};

export const DealAssigneeChip = ({
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
        value={<SelectMember.Value placeholder={placeholder} />}
      >
        <SelectMember.Content />
      </ChipPopover>
    </SelectMember.Provider>
  );
};

export const DealTagsChip = ({ value, onValueChange }: ChipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectTags.Provider
      tagType="sales:deal"
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
        value={<SelectTags.Value />}
      >
        <SelectTags.Content />
      </ChipPopover>
    </SelectTags.Provider>
  );
};

export const DealBranchesChip = ({ value, onValueChange }: ChipProps) => {
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
        value={<SelectBranches.Value />}
      >
        <SelectBranches.Content />
      </ChipPopover>
    </SelectBranches>
  );
};

export const DealDepartmentsChip = ({ value, onValueChange }: ChipProps) => {
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
        value={<SelectStage.Value />}
      >
        <SelectStage.Content />
      </ChipPopover>
    </SelectStage.Provider>
  );
};

export const DealCustomerChip = ({ value, onValueChange }: ChipProps) => {
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
        value={<SelectCustomer.Value />}
      >
        <SelectCustomer.Content />
      </ChipPopover>
    </SelectCustomer.Provider>
  );
};

export const DealCompanyChip = ({ value, onValueChange }: ChipProps) => {
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
        value={<SelectCompany.Value />}
      >
        <SelectCompany.Content />
      </ChipPopover>
    </SelectCompany.Provider>
  );
};

export const DealBrokerTypeChip = ({
  value,
  options,
  onValueChange,
}: {
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
      value={<Combobox.Value value={selected?.label} />}
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
