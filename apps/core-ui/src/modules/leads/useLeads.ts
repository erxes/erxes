import type { Customer, LeadRecordType, LeadStage, LeadStageKind } from '@erxes/core-contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { LEADS_NS } from './i18n';

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

/** The organisation's lead stages, in order, with how many leads each holds. */
export const leadStagesQuery = () => orpc.leads.stages.queryOptions();

export const useLeadStages = () => {
  const query = useQuery(leadStagesQuery());
  const stages = query.data?.data ?? [];

  return {
    stages,
    byId: new Map(stages.map((stage) => [stage.id, stage])),
    loading: query.isPending,
    error: query.error,
  };
};

/** After leads move, every list, count and report is stale. */
export const useRefreshLeads = () => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.customers.key() }),
      client.invalidateQueries({ queryKey: orpc.companies.key() }),
      client.invalidateQueries({ queryKey: orpc.leads.key() }),
    ]);
};

export const useMoveLeads = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();
  const { t } = useTranslation(LEADS_NS);

  return useMutation(
    orpc.leads.move.mutationOptions({
      onSettled: refresh,
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('actions.move-failed'),
          description: messageOf(error),
        }),
    }),
  );
};

export const useConvertLeads = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();
  const { t } = useTranslation(LEADS_NS);

  return useMutation(
    orpc.leads.convert.mutationOptions({
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
    }),
  );
};

export const useLeadStageMutations = () => {
  const refresh = useRefreshLeads();
  const { toast } = useToast();

  const handlers = {
    onSettled: refresh,
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: 'Could not save', description: messageOf(error) }),
  };

  return {
    create: useMutation(orpc.leads.createStage.mutationOptions(handlers)),
    update: useMutation(orpc.leads.updateStage.mutationOptions(handlers)),
    reorder: useMutation(orpc.leads.reorderStages.mutationOptions(handlers)),
    remove: useMutation(orpc.leads.removeStage.mutationOptions(handlers)),
  };
};

export const useLeadReport = (range: { recordType: LeadRecordType; from: string; to: string }) =>
  useQuery(orpc.leads.report.queryOptions({ input: range }));

/** Days since a moment, for "4 days in stage". */
export const daysSince = (iso: string | null, now: number) =>
  iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000)) : null;

export const firstOfKind = (stages: LeadStage[], kind: LeadStageKind) =>
  stages.find((stage) => stage.kind === kind);
