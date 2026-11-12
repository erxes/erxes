import type { Customer, LeadRecordType, LeadStage, LeadStageKind } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { CUSTOMERS_KEY } from '~/modules/contacts/customers/useCustomers';
import { COMPANIES_KEY } from '~/modules/contacts/companies/useCompanies';
import { LEADS_NS } from './i18n';
import { useTranslation } from 'react-i18next';

/** What lead screens need of a person or a company (both have it). */
export type LeadRecord = Pick<
  Customer,
  | 'id'
  | 'state'
  | 'ownerId'
  | 'leadStageId'
  | 'leadStageChangedAt'
  | 'disqualifyReason'
  | 'source'
  | 'sourceDetails'
  | 'convertedAt'
>;

/** A stage's lead count for people or companies. */
export const leadCountOf = (stage: LeadStage, recordType: LeadRecordType) =>
  recordType === 'company' ? stage.companyLeadCount : stage.leadCount;

export const LEAD_STAGES_KEY = ['lead-stages'];
export const LEADS_REPORT_KEY = ['leads', 'report'];

/** The organisation's lead stages, in order, with how many leads each holds. */
export const useLeadStages = () => {
  const query = useQuery({
    queryKey: LEAD_STAGES_KEY,
    queryFn: () => api.leads.stages(),
  });

  const stages = query.data?.data ?? [];

  return {
    stages,
    byId: new Map(stages.map((stage) => [stage.id, stage])),
    loading: query.isPending,
  };
};

/** After leads move, every list, count and report is stale. */
const useRefreshLeads = () => {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: CUSTOMERS_KEY });
    void client.invalidateQueries({ queryKey: COMPANIES_KEY });
    void client.invalidateQueries({ queryKey: LEAD_STAGES_KEY });
    void client.invalidateQueries({ queryKey: LEADS_REPORT_KEY });
  };
};

export const useMoveLeads = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();
  const { t } = useTranslation(LEADS_NS);

  return useMutation({
    mutationFn: (input: {
      recordType: LeadRecordType;
      ids: string[];
      stageId: string;
      reason?: string;
    }) => api.leads.move(input),
    onSettled: refresh,
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: t('actions.move-failed'),
        description: messageOf(error),
      }),
  });
};

export const useConvertLeads = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();
  const { t } = useTranslation(LEADS_NS);

  return useMutation({
    mutationFn: (input: {
      recordType: LeadRecordType;
      ids: string[];
      ownerId?: string;
      companyId?: string;
    }) => api.leads.convert(input),
    onSuccess: ({ converted }) =>
      toast({
        variant: 'success',
        title:
          converted === 1
            ? t('actions.converted-one')
            : t('actions.converted-many', { count: converted }),
      }),
    onSettled: refresh,
    onError: (error) =>
      toast({
        variant: 'destructive',
        title: 'Could not convert',
        description: messageOf(error),
      }),
  });
};

export const useLeadStageMutations = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();

  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: 'Could not save',
      description: messageOf(error),
    });

  return {
    create: useMutation({
      mutationFn: (input: { name: string; kind?: LeadStageKind; color?: string }) =>
        api.leads.createStage(input),
      onSettled: refresh,
      onError,
    }),
    update: useMutation({
      mutationFn: (input: { id: string; name?: string; kind?: LeadStageKind; color?: string }) =>
        api.leads.updateStage(input),
      onSettled: refresh,
      onError,
    }),
    reorder: useMutation({
      mutationFn: (ids: string[]) => api.leads.reorderStages({ ids }),
      onSettled: refresh,
      onError,
    }),
    remove: useMutation({
      mutationFn: (input: { id: string; moveTo?: string }) => api.leads.removeStage(input),
      onSettled: refresh,
      onError,
    }),
  };
};

export const useLeadReport = (range: { recordType: LeadRecordType; from: string; to: string }) =>
  useQuery({
    queryKey: [...LEADS_REPORT_KEY, range],
    queryFn: () => api.leads.report(range),
  });

export const useLeadHistory = (id: string | null) =>
  useQuery({
    queryKey: ['leads', 'history', id],
    queryFn: () => api.leads.history({ id: id! }),
    enabled: Boolean(id),
  });

/** Days since a moment, for "4 days in stage". */
export const daysSince = (iso: string | null) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)) : null;

export const firstOfKind = (stages: LeadStage[], kind: LeadStageKind) =>
  stages.find((stage) => stage.kind === kind);
