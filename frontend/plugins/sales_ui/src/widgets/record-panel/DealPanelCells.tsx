import {
  SelectLabels,
  SelectLabelsContent,
  SelectLabelsValue,
} from '@/deals/components/common/filters/SelectLabel';
import {
  Icon,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconGitBranch,
  IconProgress,
} from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import {
  PanelFieldTrigger,
  SelectBoard,
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
  SelectPipeline,
  SelectStage,
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
      autoSelectFirst={false}
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

export const DealPanelBoardCell = ({
  value,
  onValueChange,
  placeholder,
}: TCellProps & { placeholder?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectBoard.Provider
      mode="single"
      value={value}
      onValueChange={(next) => {
        onValueChange(next);
        setOpen(false);
      }}
    >
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<SelectBoard.Value placeholder={placeholder} />}
      >
        <SelectBoard.Content />
      </PanelPopoverCell>
    </SelectBoard.Provider>
  );
};

export const DealPanelPipelineCell = ({
  value,
  boardId,
  onValueChange,
  placeholder,
}: TCellProps & { boardId?: string; placeholder?: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectPipeline.Provider
      mode="single"
      boardId={boardId}
      value={value}
      onValueChange={(next) => {
        onValueChange(next);
        setOpen(false);
      }}
    >
      <PanelPopoverCell
        open={open}
        onOpenChange={setOpen}
        value={<SelectPipeline.Value placeholder={placeholder} />}
      >
        <SelectPipeline.Content />
      </PanelPopoverCell>
    </SelectPipeline.Provider>
  );
};

export const DealPanelLabelsCell = ({
  value,
  pipelineId,
  onValueChange,
}: {
  value: string[];
  pipelineId?: string;
  onValueChange: (value: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectLabels
      mode="multiple"
      pipelineId={pipelineId}
      value={value}
      onValueChange={(next) =>
        onValueChange(
          (Array.isArray(next) ? next : [next]).filter(
            (id): id is string => !!id,
          ),
        )
      }
    >
      <div className="[&_.-ml-1]:ml-0!">
        <PanelPopoverCell
          open={open}
          onOpenChange={setOpen}
          value={<SelectLabelsValue showLabels />}
        >
          <SelectLabelsContent />
        </PanelPopoverCell>
      </div>
    </SelectLabels>
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
