import { NetworkStatus, useQuery } from '@apollo/client';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useDebounce } from 'use-debounce';
import type { IFieldData } from '../components/FormDndProvider';
import { FORM_CONVERSION_CHECK } from '../graphql/formConversion';
import { useFormDetail } from './useFormDetail';

export const useFormFieldConversion = (
  draft: IFieldData | undefined,
  otherFields: IFieldData[],
) => {
  const { formId } = useParams();
  const {
    formDetail,
    loading: formLoading,
    error: formError,
    refetch: refetchForm,
  } = useFormDetail({
    formId: formId ?? '',
  });
  const savedField = formDetail?.fields?.find(
    (field) => field?._id === draft?.id,
  );
  const converting = !!draft?.expectedType && draft.type !== draft.expectedType;
  const detailUnavailable =
    converting && !!formId && !formLoading && (!formDetail || !!formError);
  const enabled =
    !!formId &&
    converting &&
    (!!savedField || formLoading || detailUnavailable);
  const [search, setSearch] = useState('');
  const signature = JSON.stringify({
    formId,
    fieldId: draft?.id ?? '',
    expectedType: draft?.expectedType ?? '',
    targetType: draft?.type ?? '',
    validator: draft?.validator,
    draftFields: [...otherFields, ...(draft ? [draft] : [])].map((field) => ({
      _id: field.id,
      text: field.label,
      type: field.type,
      expectedType: field.expectedType,
      logics: field.logics,
      validator: field.validator,
    })),
  });
  const [debouncedSignature] = useDebounce(signature, 400);
  const [previousSignature, setPreviousSignature] = useState(signature);
  // A new target or rule resets the review; no previous result can enable Confirm.
  if (signature !== previousSignature) {
    setPreviousSignature(signature);
    setSearch('');
  }
  const reviewKey = JSON.stringify([signature, search]);
  const pagination = useRef({ key: reviewKey, page: 1, loading: false });
  if (pagination.current.key !== reviewKey) {
    pagination.current = { key: reviewKey, page: 1, loading: false };
  }
  const [moreFailure, setMoreFailure] = useState<{
    request: typeof pagination.current;
    error: unknown;
  }>();
  const {
    data,
    loading,
    networkStatus,
    error: checkError,
    refetch,
    fetchMore,
  } = useQuery(FORM_CONVERSION_CHECK, {
    variables: {
      formId: formId ?? '',
      fieldId: draft?.id ?? '',
      expectedType: draft?.expectedType ?? '',
      targetType: draft?.type ?? '',
      validator: draft?.validator,
      draftFields: [...otherFields, ...(draft ? [draft] : [])].map((field) => ({
        _id: field.id,
        text: field.label,
        type: field.type,
        expectedType: field.expectedType,
        logics: field.logics,
        validator: field.validator,
      })),
      page: 1,
      search,
    },
    skip:
      !enabled ||
      !savedField ||
      !!formError ||
      signature !== debouncedSignature,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const error = detailUnavailable
    ? formError ?? new Error('Could not load the form fields.')
    : checkError;
  const checking =
    (converting && !!formId && formLoading) ||
    (enabled &&
      ((loading && networkStatus !== NetworkStatus.fetchMore) ||
        signature !== debouncedSignature));
  const result =
    enabled && !checking && !error
      ? data?.frontlineFormFieldConversionCheck
      : undefined;
  const loadMoreError =
    moreFailure?.request === pagination.current ? moreFailure.error : undefined;
  const loadMore = async (retry = false): Promise<void> => {
    if (
      !result?.hasMore ||
      checking ||
      pagination.current.loading ||
      (loadMoreError && !retry)
    )
      return;
    const page = pagination.current.page + 1;
    const request = pagination.current;
    pagination.current.loading = true;
    setMoreFailure(undefined);
    try {
      await fetchMore({
        variables: { page },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (pagination.current !== request) return previous;
          const next = fetchMoreResult.frontlineFormFieldConversionCheck;
          const examples = new Map(
            [
              ...previous.frontlineFormFieldConversionCheck.examples,
              ...next.examples,
            ].map((example) => [example.id, example]),
          );
          return {
            ...previous,
            frontlineFormFieldConversionCheck: {
              ...next,
              examples: Array.from(examples.values()),
            },
          };
        },
      });
      if (pagination.current === request) pagination.current.page = page;
    } catch (error) {
      if (pagination.current === request) setMoreFailure({ request, error });
    } finally {
      if (pagination.current === request) pagination.current.loading = false;
    }
  };
  return {
    formId,
    savedField,
    enabled,
    checking,
    result,
    error,
    canConfirm:
      !checking && (!enabled || (!!result && result.invalidCount === 0)),
    reviewKey,
    search,
    searchAnswers: (value: string) => setSearch(value.trim()),
    loadMore: () => loadMore(),
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    loadMoreError,
    retryLoadMore: () => loadMore(true),
    retry: () => {
      void (detailUnavailable ? refetchForm() : refetch()).catch(
        () => undefined,
      );
    },
  };
};
