import { Checkbox, Form, Spinner } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { usePublicApiOperations } from '../hooks/usePublicApiOperations';

/** Return the selected operation IDs after one checkbox transition. */
const getUpdatedOperationIds = (
  selectedIds: string[],
  operationId: string,
  checked: boolean,
) => {
  if (!checked) {
    return selectedIds.filter((id) => id !== operationId);
  }

  if (selectedIds.includes(operationId)) {
    return selectedIds;
  }

  return [...selectedIds, operationId];
};

/** Render the published-operation allowlist for an OAuth client. */
export const PublicApiOperationSelector = () => {
  const form = useFormContext<TOAuthClientsForm>();
  const { operations, loading, error } = usePublicApiOperations();
  const { t } = useTranslation('settings', {
    keyPrefix: 'oauth-clients',
  });

  return (
    <Form.Field
      control={form.control}
      name="allowedPublicOperationIds"
      render={({ field }) => {
        const selectedIds = field.value ?? [];

        return (
          <Form.Item>
            <Form.Label>{t('public-operations')}</Form.Label>
            <Form.Description>
              {t('public-operations-description')}
            </Form.Description>
            <Form.Control>
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner />
                    {t('loading-public-operations')}
                  </div>
                )}

                {!loading && error && (
                  <p className="text-sm text-destructive">
                    {t('public-operations-load-failed')}
                  </p>
                )}

                {!loading && !error && operations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('no-public-operations')}
                  </p>
                )}

                {!loading &&
                  !error &&
                  operations.map((operation) => (
                    <label
                      key={operation.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedIds.includes(operation.id)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            getUpdatedOperationIds(
                              selectedIds,
                              operation.id,
                              checked === true,
                            ),
                          )
                        }
                      />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="text-sm font-medium">
                          {operation.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {operation.description}
                        </span>
                        <code className="break-all text-xs text-muted-foreground">
                          {operation.id}
                        </code>
                      </span>
                    </label>
                  ))}
              </div>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
};
