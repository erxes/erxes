import { useQuery } from '@apollo/client';
import type { QueryResult } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useDebounce } from 'use-debounce';
import { EMAIL_TEMPLATE_PICKER_QUERY } from '../graphql/queries';
import { emailTemplateFormat } from '../types';
import type {
  EmailTemplate,
  EmailTemplateContentFormat,
  EmailTemplateListResult,
} from '../types';

export interface EmailTemplatePickerOptions {
  disabled?: boolean;
  format?: EmailTemplateContentFormat;
  onSelect: (template: EmailTemplate) => Promise<void> | void;
}

interface EmailTemplatePickerState {
  disabled: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  applyingId?: string;
  applying: boolean;
  templates: EmailTemplate[];
  hasNextPage: boolean;
  loading: boolean;
  error: QueryResult<EmailTemplateListResult>['error'];
  refetch: QueryResult<EmailTemplateListResult>['refetch'];
  select: (template: EmailTemplate) => Promise<void>;
  loadMore: () => void;
}

export const useEmailTemplatePicker = ({
  disabled = false,
  format,
  onSelect,
}: EmailTemplatePickerOptions): EmailTemplatePickerState => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 250);
  const [applyingId, setApplyingId] = useState<string>();
  const applying = Boolean(applyingId);
  const { data, loading, error, refetch, fetchMore } =
    useQuery<EmailTemplateListResult>(EMAIL_TEMPLATE_PICKER_QUERY, {
      variables: { searchValue: searchValue || undefined },
      skip: !open,
      notifyOnNetworkStatusChange: true,
    });
  const select = async (template: EmailTemplate) => {
    if (disabled || applying) return;
    setApplyingId(template._id);
    try {
      await onSelect(template);
      setOpen(false);
    } catch (cause) {
      toast({
        title: 'Unable to select email template',
        description: cause instanceof Error ? cause.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setApplyingId(undefined);
    }
  };
  const loadMore = () => {
    if (
      loading ||
      !data?.emailTemplates.pageInfo.hasNextPage ||
      !data.emailTemplates.pageInfo.endCursor
    )
      return;
    void fetchMore({
      variables: {
        cursor: data.emailTemplates.pageInfo.endCursor,
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous;
        const ids = new Set(
          previous.emailTemplates.list.map((template) => template._id),
        );
        return {
          emailTemplates: {
            ...fetchMoreResult.emailTemplates,
            list: [
              ...previous.emailTemplates.list,
              ...fetchMoreResult.emailTemplates.list.filter(
                (template) => !ids.has(template._id),
              ),
            ],
          },
        };
      },
    }).catch(() =>
      toast({
        title: 'Unable to load more email templates',
        variant: 'destructive',
      }),
    );
  };
  return {
    disabled,
    open,
    setOpen,
    search,
    setSearch,
    applyingId,
    applying,
    templates: (data?.emailTemplates.list ?? []).filter(
      (template) => !format || emailTemplateFormat(template) === format,
    ),
    hasNextPage: Boolean(data?.emailTemplates.pageInfo.hasNextPage),
    loading,
    error,
    refetch,
    select,
    loadMore,
  };
};
