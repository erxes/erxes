import { Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { Control } from 'react-hook-form';
import { GridRows } from '../../properties/components/GridRows';
import { useSystemFieldsLayout } from '../../properties/hooks/useSystemFieldsLayout';
import { buildLayoutRows } from '../../properties/utils/groupLayout';
import { CUSTOMER_FIELD_RENDERERS } from './customerFieldRenderers';
import { ICustomerFormValues } from './customerFormSchema';

const WIDE_CODES = new Set(['avatar', 'description']);

const useCustomerFieldRows = (isShown: (code: string) => boolean) => {
  const { layout, loading } = useSystemFieldsLayout('core:customer');

  const rows = useMemo(
    () =>
      buildLayoutRows({
        layout,
        items: Object.keys(CUSTOMER_FIELD_RENDERERS).filter(isShown),
        getId: (code) => code,
        isWide: (code) => WIDE_CODES.has(code),
      }),
    [layout, isShown],
  );

  return { rows, loading };
};

// Basic information drawn from Settings: what shows, what is required, and where.
export const CustomerSystemFields = ({
  control,
  isShown,
  isRequired,
}: {
  control: Control<ICustomerFormValues>;
  isShown: (code: string) => boolean;
  isRequired: (code: string) => boolean;
}) => {
  const { rows, loading } = useCustomerFieldRows(isShown);

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  return (
    <GridRows
      rows={rows}
      getKey={(code) => code}
      render={(code) => {
        const Renderer = CUSTOMER_FIELD_RENDERERS[code];

        return (
          Renderer && (
            <Renderer
              key={code}
              control={control}
              required={isRequired(code)}
            />
          )
        );
      }}
    />
  );
};
