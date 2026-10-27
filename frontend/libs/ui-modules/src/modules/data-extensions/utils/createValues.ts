import {
  ApolloClient,
  ApolloLink,
  FetchResult,
  gql,
  Observable,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { toast } from 'erxes-ui';
import { getI18n } from 'react-i18next';
import {
  DataExtensionValue,
  IDataExtensionField,
  IDataExtensionRecordType,
} from '../types';
import { buildPatchMutation, typedRequestOptions } from './typedOperations';

/** Values a create form holds for a record that does not exist yet. */
export interface IDataExtensionCreateValues {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  recordTypes: IDataExtensionRecordType[];
  values: Record<string, DataExtensionValue>;
  /** Called once the values were written, so the form can clear them. */
  onSaved: () => void;
}

const pendingByRecordType = new Map<string, IDataExtensionCreateValues>();

const isEmptyValue = (value: DataExtensionValue) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && !value.length);

/** Holds a create form's filled values until its create mutation returns. */
export const setDataExtensionCreateValues = (
  pending: IDataExtensionCreateValues,
) => {
  const values = Object.fromEntries(
    Object.entries(pending.values).filter(([, value]) => !isEmptyValue(value)),
  );

  if (Object.keys(values).length) {
    pendingByRecordType.set(pending.recordType.recordType, {
      ...pending,
      values,
    });
  } else {
    pendingByRecordType.delete(pending.recordType.recordType);
  }
};

export const clearDataExtensionCreateValues = (recordType: string) => {
  pendingByRecordType.delete(recordType);
};

const takePendingFor = (mutationField: string) => {
  const matches = [...pendingByRecordType.values()].filter(({ recordType }) =>
    recordType.createMutations.includes(mutationField),
  );

  for (const { recordType } of matches) {
    pendingByRecordType.delete(recordType.recordType);
  }

  return matches;
};

const createdRecordId = (value: unknown): string | undefined => {
  const id =
    value && typeof value === 'object'
      ? (value as { _id?: unknown })._id
      : undefined;

  return typeof id === 'string' ? id : undefined;
};

/**
 * Writes held values onto the records a create mutation returned, through
 * the tenant endpoint's patch, so the owner validates them as on any edit.
 * Returns the writes that failed.
 */
const saveCreatedRecordValues = async (
  client: ApolloClient<unknown>,
  data: FetchResult['data'],
) => {
  const failures: unknown[] = [];

  for (const [mutationField, created] of Object.entries(data || {})) {
    const _id = createdRecordId(created);

    if (!_id) {
      continue;
    }

    for (const pending of takePendingFor(mutationField)) {
      try {
        await client.mutate({
          mutation: gql(
            buildPatchMutation(
              pending.recordType,
              pending.fields,
              pending.recordTypes,
            ),
          ),
          variables: { _id, values: pending.values },
          ...typedRequestOptions,
        });
        pending.onSaved();
      } catch (error) {
        failures.push(error);
      }
    }
  }

  return failures;
};

/**
 * Only one toast shows at a time, so the warning waits until the form's own
 * success toast is out; otherwise that toast would replace it unseen.
 */
const warnValuesNotSaved = (failures: unknown[]) =>
  setTimeout(() => {
    for (const error of failures) {
      toast({
        variant: 'destructive',
        title: getI18n().t('toast.created-values-failed', {
          ns: 'dataExtensions',
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    }
  });

/**
 * Apollo link that completes module create mutations with the Data
 * Extension values typed into their forms. The result is passed on only
 * after the values are written, so a detail opened on success shows them.
 * Mutations no form is waiting on pass straight through.
 */
export const createDataExtensionsCreateLink = (
  getClient: () => ApolloClient<unknown>,
) =>
  new ApolloLink((operation, forward) => {
    const definition = getMainDefinition(operation.query);

    if (
      definition.kind !== 'OperationDefinition' ||
      definition.operation !== 'mutation' ||
      !pendingByRecordType.size
    ) {
      return forward(operation);
    }

    return new Observable<FetchResult>((observer) => {
      let written = Promise.resolve();

      const subscription = forward(operation).subscribe({
        next: (result) => {
          written = written
            .then(() => saveCreatedRecordValues(getClient(), result.data))
            .then((failures) => {
              observer.next(result);

              if (failures.length) {
                warnValuesNotSaved(failures);
              }
            });
        },
        error: (error) => observer.error(error),
        complete: () => {
          written.then(() => observer.complete());
        },
      });

      return () => subscription.unsubscribe();
    });
  });
