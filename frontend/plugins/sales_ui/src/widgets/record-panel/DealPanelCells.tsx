import {
  Icon,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconGitBranch,
  IconProgress,
} from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTableInlineCell } from 'erxes-ui';
import { useMemo, useState } from 'react';
import {
  PanelFieldTrigger,
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
  SelectStage,
  TagsSelect,
} from 'ui-modules';

type TValue = string | string[];

type TCellProps = {
  value?: TValue;
  onValueChange: (value: TValue) => void;
};

const PanelPopoverCell = ({
  open,
  onOpenChange,
  value,
  icon: ValueIcon,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: React.ReactNode;
  icon?: Icon;
  children: React.ReactNode;
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PanelFieldTrigger>
      {ValueIcon && (
        <ValueIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
      {value}
    </PanelFieldTrigger>
    <RecordTableInlineCell.Content>{children}</RecordTableInlineCell.Content>
  </Popover>
);

export const DealPanelMemberCell = ({
  value,
  onValueChange,
  placeholder,
  mode = 'multiple',
}: TCellProps & { placeholder?: string; mode?: 'single' | 'multiple' }) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<SelectMember.Value placeholder={placeholder} size="default" />}
      >
        <SelectMember.Content />
      </PanelPopoverCell>
    </SelectMember.Provider>
  );
};

export const DealPanelTagsCell = ({
  value,
  onValueChange,
  placeholder,
}: TCellProps & { placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const tagIds = useMemo(() => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [value]);

  return (
    <TagsSelect.Provider
      value={tagIds}
      mode="multiple"
      type="sales:deal"
      onValueChange={onValueChange}
    >
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<TagsSelect.Value placeholder={placeholder} showValue />}
      >
        <TagsSelect.Content />
      </PanelPopoverCell>
    </TagsSelect.Provider>
  );
};

export const DealPanelBranchesCell = ({ value, onValueChange }: TCellProps) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        icon={IconGitBranch}
        value={<SelectBranches.Value />}
      >
        <SelectBranches.Content />
      </PanelPopoverCell>
    </SelectBranches>
  );
};

export const DealPanelDepartmentsCell = ({
  value,
  onValueChange,
}: TCellProps) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        icon={IconBuildingSkyscraper}
        value={<SelectDepartments.Value />}
      >
        <SelectDepartments.Content />
      </PanelPopoverCell>
    </SelectDepartments>
  );
};

export const DealPanelStageCell = ({
  value,
  pipelineId,
  onValueChange,
}: TCellProps & { pipelineId?: string }) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        icon={IconProgress}
        value={<SelectStage.Value />}
      >
        <SelectStage.Content />
      </PanelPopoverCell>
    </SelectStage.Provider>
  );
};

export const DealPanelCustomerCell = ({
  value,
  onValueChange,
  placeholder,
}: TCellProps & { placeholder?: string }) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<SelectCustomer.Value placeholder={placeholder} />}
      >
        <SelectCustomer.Content />
      </PanelPopoverCell>
    </SelectCustomer.Provider>
  );
};

export const DealPanelCompanyCell = ({
  value,
  onValueChange,
  placeholder,
}: TCellProps & { placeholder?: string }) => {
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
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<SelectCompany.Value placeholder={placeholder} />}
      >
        <SelectCompany.Content />
      </PanelPopoverCell>
    </SelectCompany.Provider>
  );
};

export const DealPanelOptionCell = ({
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
    <PanelPopoverCell
      open={open}
      onOpenChange={setOpen}
      icon={IconBriefcase}
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
    </PanelPopoverCell>
  );
};
