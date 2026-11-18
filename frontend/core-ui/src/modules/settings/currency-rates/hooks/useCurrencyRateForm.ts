import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { currencyRateSheetAtom } from '../state';
import { currencyRateFormSchema, TCurrencyRateForm } from '../types';
import { useCurrencyRateSave } from './useCurrencyRateMutations';

export const useCurrencyRateForm = () => {
  const [sheet, setSheet] = useAtom(currencyRateSheetAtom);
  const editing = sheet && sheet !== 'new' ? sheet : null;
  const { save, loading } = useCurrencyRateSave();

  const form = useForm<TCurrencyRateForm>({
    resolver: zodResolver(currencyRateFormSchema),
  });

  useEffect(() => {
    if (!sheet) return;

    form.reset(
      editing
        ? {
            date: new Date(editing.date),
            rateCurrency: editing.rateCurrency,
            rate: editing.rate,
          }
        : { date: new Date(), rateCurrency: '', rate: undefined },
    );
  }, [sheet, editing, form]);

  const close = () => setSheet(null);

  const onSubmit = form.handleSubmit(async (values) => {
    if (await save(values, editing?._id)) {
      close();
    }
  });

  return { form, open: !!sheet, editing, loading, onSubmit, close };
};
