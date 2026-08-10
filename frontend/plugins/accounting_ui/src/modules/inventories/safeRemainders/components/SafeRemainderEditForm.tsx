import { JournalEnum } from '@/settings/account/types/Account';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconExternalLink,
  IconShoppingCart,
} from '@tabler/icons-react';
import { Button, Form, Spinner, useQueryState } from 'erxes-ui';
import { ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderEdit } from '../hooks/useSafeRemainderEdit';
import { TSafeRemainderEditForm } from '../types/safeRemainderForm';
import { safeRemainderEditSchema } from '../types/safeRemainderSchema';

export const EditSafeRemainder = () => {
  const { t } = useTranslation('accounting');
  const form = useForm<TSafeRemainderEditForm>({
    resolver: zodResolver(safeRemainderEditSchema),
    defaultValues: {},
  });
  const [id] = useQueryState<string>('id');
  const { safeRemainder, loading: detailLoading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });

  useEffect(() => {
    if (safeRemainder) {
      form.reset({ ...safeRemainder });
    }
  }, [safeRemainder, form]);

  const { submitSafeRemainder, loading } = useSafeRemainderEdit(id || '');
  const onSubmit = (data: TSafeRemainderEditForm) => {
    submitSafeRemainder({
      variables: { ...data },
      onCompleted: () => {
        form.reset();
      },
    });
  };

  const onError = (error: any) => {
    return {};
  };

  if (detailLoading) {
    return <Spinner />;
  }

  return (
    <Form {...form}>
      <form
        className="p-6 flex-auto overflow-auto"
        onSubmit={form.handleSubmit(onSubmit, onError)}
      >
        <div className="max-w-3xl space-y-4">
          <RuleSection
            title="Орлого"
            icon={<IconArrowDownLeft size={16} />}
            trId={safeRemainder?.incomeTrId}
          >
            <Form.Field
              control={form.control}
              name="incomeRule.accountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('account')}</Form.Label>
                  <Form.Control>
                    <SelectAccount
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RuleSection>

          <RuleSection
            title="Зарлага"
            icon={<IconArrowUpRight size={16} />}
            trId={safeRemainder?.outTrId}
          >
            <Form.Field
              control={form.control}
              name="outRule.accountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('account')}</Form.Label>
                  <Form.Control>
                    <SelectAccount
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RuleSection>

          <RuleSection
            title="Борлуулалт"
            icon={<IconShoppingCart size={16} />}
            trId={safeRemainder?.saleTrId}
          >
            <Form.Field
              control={form.control}
              name="saleRule.outAccountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('account')}</Form.Label>
                  <Form.Control>
                    <SelectAccount
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="saleRule.costAccountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('cost-account')}</Form.Label>
                  <Form.Control>
                    <SelectAccount
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="saleRule.accountId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('sale-account')}</Form.Label>
                  <Form.Control>
                    <SelectAccount
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </RuleSection>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" disabled={loading}>
              {loading && <Spinner />}
              {t('save')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

const RuleSection = ({
  title,
  description,
  icon,
  trId,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  trId?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h5 className="text-sm font-semibold leading-none">{title}</h5>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {trId && (
          <Link
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            to={`/accounting/transaction/edit?parentId=${trId}&trId=${trId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconExternalLink size={14} />
            {t('transaction')}
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {children}
      </div>
    </div>
  );
};
