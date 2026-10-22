import {
  IconBuilding,
  IconCalendar,
  IconCheckbox,
  IconDatabase,
  IconHash,
  IconLink,
  IconList,
  IconPackage,
  IconPhone,
  IconTextSize,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import { DATA_MODEL_FIELD_TYPES } from '../types';
import { IconComponent } from 'erxes-ui';

const modelIcons: Record<string, typeof IconDatabase> = {
  company: IconBuilding,
  customer: IconUsers,
  user: IconUsers,
  product: IconPackage,
};
const defaultModelIcons: Record<string, typeof IconDatabase> = {
  IconDatabase,
  IconBuilding,
  IconPackage,
  IconUsers,
};
const fieldIcons: Record<string, typeof IconTextSize> = {
  number: IconHash,
  date: IconCalendar,
  boolean: IconCheckbox,
  phone: IconPhone,
  list: IconList,
  select: IconList,
  radio: IconList,
  multiSelect: IconList,
  check: IconList,
  relation: IconLink,
  actor: IconUserCircle,
};
const extraLabels: Record<string, string> = {
  radio: 'Single select',
  check: 'Multiple select',
  relation: 'Relation',
  actor: 'Actor',
};

export const DataModelIcon = ({
  name,
  icon,
}: {
  name: string;
  icon?: string;
}) => {
  const Icon = icon
    ? defaultModelIcons[icon]
    : modelIcons[name] ?? IconDatabase;
  if (!Icon)
    return (
      <IconComponent
        name={icon}
        className="size-4 shrink-0 text-primary"
        stroke={1.5}
      />
    );
  return <Icon className="size-4 shrink-0 text-primary" stroke={1.5} />;
};

export const DataModelFieldIcon = ({ type }: { type: string }) => {
  const Icon = fieldIcons[type] ?? IconTextSize;
  return <Icon className="size-3.5 shrink-0" stroke={1.5} />;
};

export const dataModelFieldLabel = (type: string): string =>
  DATA_MODEL_FIELD_TYPES.find((field) => field.value === type)?.label ??
  extraLabels[type] ??
  type;

export const DATA_MODEL_TABLE_CLASS =
  'bg-transparent [&_th]:bg-transparent [&_th]:font-sans [&_th]:font-normal [&_th]:normal-case [&_th]:text-muted-foreground [&_th]:h-10 [&_td]:border-x-0 [&_td]:bg-transparent [&_td]:px-2 [&_td]:h-10 [&_td]:border-border/60 [&_tr>td:first-child]:border-l-0';
