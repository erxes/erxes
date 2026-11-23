import { IconCornerDownLeft } from '@tabler/icons-react';
import { Command, highlightMatch, TSearchResultItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const includesSearchValue = (
  value: string | undefined,
  searchValue: string,
) => {
  const term = searchValue.trim().toLocaleLowerCase();
  const candidate = value?.toLocaleLowerCase();

  if (!candidate || !term) {
    return false;
  }

  if (candidate.includes(term)) {
    return true;
  }

  const compactTerm = term.replace(/[\s\-+()./]/g, '');
  const compactCandidate = candidate.replace(/[\s\-+()./]/g, '');

  return compactTerm.length >= 4 && compactCandidate.includes(compactTerm);
};

export const GlobalSearchItem = ({
  item,
  commandValue,
  icon: Icon,
  searchValue,
  actionLabel,
  onSelect,
}: {
  item: TSearchResultItem;
  commandValue: string;
  icon?: React.ElementType;
  searchValue: string;
  actionLabel: string;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation(['common', 'mongolian'], {
    useSuspense: false,
  });
  const visibleFieldsMatch =
    includesSearchValue(item.title, searchValue) ||
    includesSearchValue(item.description, searchValue);
  const matchedField = visibleFieldsMatch
    ? undefined
    : item.matchFields?.find(({ value }) =>
        includesSearchValue(value, searchValue),
      );

  return (
    <Command.Item
      className="group h-auto min-h-11 gap-2.5 rounded-lg px-2.5 py-2 transition-[background-color,color,transform] duration-150 data-[selected=true]:bg-accent/90 active:scale-[0.995]"
      value={commandValue}
      onSelect={() => onSelect(item.path)}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/50 text-muted-foreground transition-[background-color,border-color,color,transform] duration-150 group-data-[selected=true]:scale-105 group-data-[selected=true]:border-primary/30 group-data-[selected=true]:bg-primary/12 group-data-[selected=true]:text-primary">
        {Icon && <Icon className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-foreground">
          {highlightMatch(item.title, searchValue)}
        </span>
        {matchedField && (
          <span className="block truncate text-xs text-muted-foreground">
            {matchedField.labelKey
              ? t(matchedField.labelKey, {
                  ns: matchedField.labelNamespace,
                  defaultValue: matchedField.label,
                })
              : matchedField.label}
            : {highlightMatch(matchedField.value, searchValue)}
          </span>
        )}
        {!matchedField && item.description && (
          <span className="block truncate text-xs text-muted-foreground">
            {highlightMatch(item.description, searchValue)}
          </span>
        )}
      </span>
      <Command.Shortcut className="flex shrink-0 items-center gap-1.5 tracking-normal">
        <span className="hidden text-xs text-muted-foreground transition-colors group-data-[selected=true]:text-foreground sm:inline">
          {actionLabel}
        </span>
        <span className="hidden size-5 items-center justify-center rounded-md bg-primary/12 text-primary group-data-[selected=true]:inline-flex">
          <IconCornerDownLeft className="size-3.5" />
        </span>
      </Command.Shortcut>
    </Command.Item>
  );
};
