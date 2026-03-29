import { JournalEnum } from '@/settings/account/types/Account';
import { zodResolver } from '@hookform/resolvers/zod';
import deepEqual from 'deep-equal';
import {
  Button,
  Dialog,
  Form,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';
import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderEdit } from '../hooks/useSafeRemainderEdit';
import { TSafeRemainderEditForm } from '../types/safeRemainderForm';
import { safeRemainderEditSchema } from '../types/safeRemainderSchema';

export const EditSafeRemainder = () => {
  const form = useForm<TSafeRemainderEditForm>({
    resolver: zodResolver(safeRemainderEditSchema),
    defaultValues: {

    }
  });
  const [id] = useQueryState<string>('id');
  const { safeRemainder, loading: detailLoading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { reset } = form;

  useEffect(() => {
    // Only reset if configs are different from current form values
    const currentValues = form.getValues();
    const hasChanges = !deepEqual(safeRemainder, currentValues);

    if (hasChanges) {
      reset({ ...safeRemainder });
    }

  }, [safeRemainder, reset, form]);

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
        <h5 className="">
          Орлого: {safeRemainder?.incomeTrId ? <Link
            className="text-blue-500 underline"
            to={`/accounting/transaction/edit?parentId=${safeRemainder.incomeTrId}&trId=${safeRemainder.incomeTrId}}`}
            target="_blank"
            rel="noopener noreferrer"
          >( Гүйлгээ )</Link> : ''}
        </h5>
        <div className='flex flex-wrap items-center justify-start gap-2 max-w-full'>
          <Form.Field
            control={form.control}
            name="incomeRule.accountId"
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Form.Label>Account</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                    mode='single'
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <h5 className="">
          Зарлага: {safeRemainder?.outTrId ? <Link
            className="text-blue-500 underline"
            to={`/accounting/transaction/edit?parentId=${safeRemainder.outTrId}&trId=${safeRemainder.outTrId}}`}
            target="_blank"
            rel="noopener noreferrer"
          >( Гүйлгээ )</Link> : ''}
        </h5>
        <div className='flex flex-wrap items-center justify-start gap-2 max-w-full'>
          <Form.Field
            control={form.control}
            name="outRule.accountId"
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Form.Label>Account</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                    mode='single'
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <h5 className="">
          Борлуулалт: {safeRemainder?.saleTrId ? <Link
            className="text-blue-500 underline"
            to={`/accounting/transaction/edit?parentId=${safeRemainder.saleTrId}&trId=${safeRemainder.saleTrId}}`}
            target="_blank"
            rel="noopener noreferrer"
          >( Гүйлгээ )</Link> : ''}
        </h5>
        <div className='flex flex-wrap items-center justify-start gap-2 max-w-full'>
          <Form.Field
            control={form.control}
            name="saleRule.outAccountId"
            render={({ field }) => (
              <Form.Item className="col-span-2">
                <Form.Label>Account</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
                    mode='single'
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
              <Form.Item className="col-span-2">
                <Form.Label>COST Account</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                    mode='single'
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
              <Form.Item className="col-span-2">
                <Form.Label>SALE Account</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultFilter={{ journals: [JournalEnum.INV_FOLLOW] }}
                    mode='single'
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Dialog.Footer className="col-span-2 mt-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            Save
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
