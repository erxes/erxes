import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { uploadEmailImage } from '@/emailTemplates/utils/uploadEmailImage';
import { getEmailBrandSchema, TEmailBrandForm } from '../schema/emailBrandSchema';
import { useNotificationEmailBrand } from './useNotificationEmailBrand';

const DEFAULT_COLOR = '#4f46e5';

export const useEmailBrandForm = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { toast } = useToast();
  const { brand, loading, saving, updateBrand } = useNotificationEmailBrand();
  const [uploading, setUploading] = useState(false);

  const schema = useMemo(() => getEmailBrandSchema(t), [t]);
  const form = useForm<TEmailBrandForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', logoUrl: '', color: DEFAULT_COLOR, footerText: '' },
  });
  const [logoUrl, color] = useWatch({
    control: form.control,
    name: ['logoUrl', 'color'],
  });

  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name || '',
        logoUrl: brand.logoUrl || '',
        color: brand.color || DEFAULT_COLOR,
        footerText: brand.footerText || '',
      });
    }
  }, [brand, form]);

  const uploadLogo = async (file?: File) => {
    if (!file) {
      return;
    }

    setUploading(true);

    try {
      form.setValue('logoUrl', await uploadEmailImage(file), {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (e) {
      toast({
        title: t('brand-logo-not-uploaded'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const save = form.handleSubmit(async (values) => {
    const saved = await updateBrand(values);

    if (saved) {
      form.reset(values);
    }
  });

  return { form, logoUrl, color, loading, saving, uploading, uploadLogo, save };
};
