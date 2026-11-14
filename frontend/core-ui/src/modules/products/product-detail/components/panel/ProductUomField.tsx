import { ApolloError } from '@apollo/client';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import {
  Command,
  PopoverScoped,
  RecordTableInlineCell,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelFieldTrigger } from 'ui-modules';
import { uomQuery } from '@/products/graphql/UomQuery';
import { useUom } from '@/products/hooks/useUom';
import { useUomsAdd } from '@/products/settings/hooks/useUomsAdd';

// Codes as the product forms make them from a new UOM's name.
const toUomCode = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '_');

/**
 * The product's unit of measurement: pick one, or type a name no unit has
 * and create it on the spot, as the product forms allow.
 */
export const ProductUomField = ({
  scope,
  value,
  placeholder,
  onChange,
}: {
  scope: string;
  value: string;
  placeholder: string;
  onChange: (uom: string) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { toast } = useToast();
  const { uoms, loading } = useUom({});
  const { uomsAdd, loading: adding } = useUomsAdd();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectable = uoms.filter((uom) => (uom.code ?? '').trim());
  // A product's `uom` reads back as the unit's name; it is saved as its code.
  const current = selectable.find(
    (uom) => uom.code === value || uom.name === value,
  );
  const term = search.trim();
  const canCreate =
    !loading &&
    !!term &&
    !selectable.some(
      ({ name, code }) =>
        name.toLowerCase() === term.toLowerCase() || code === toUomCode(term),
    );

  const select = (code: string) => {
    setOpen(false);
    setSearch('');
    if (code !== current?.code) onChange(code);
  };

  const create = () => {
    const code = toUomCode(term);
    uomsAdd({
      variables: { name: term, code },
      // The panel lists UOMs from its own query.
      refetchQueries: [{ query: uomQuery }],
      onCompleted: () => select(code),
      onError: (error: ApolloError) =>
        toast({
          title: t('errorTitle'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <PopoverScoped
      scope={scope}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
      }}
    >
      <PanelFieldTrigger>
        {current?.name || value || (
          <span className="text-accent-foreground">{placeholder}</span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('search-uom', 'Search or create a UOM')}
          />
          <Command.List>
            <Command.Empty>
              {loading ? t('loading', 'Loading...') : t('no-uoms', 'No UOMs')}
            </Command.Empty>
            {selectable.map((uom) => (
              <Command.Item
                key={uom._id}
                value={`${uom.name} ${uom.code}`}
                onSelect={() => select(uom.code)}
              >
                <span className="flex-1">{uom.name}</span>
                {uom._id === current?._id && <IconCheck className="size-4" />}
              </Command.Item>
            ))}
            {canCreate && (
              <Command.Item
                value={`create ${term}`}
                disabled={adding}
                onSelect={create}
              >
                <IconPlus className="size-4" />
                {t('create-uom', 'Create “{{name}}”', { name: term })}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
