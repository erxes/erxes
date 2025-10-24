import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { TConfig } from '@/settings/file-upload/types';
import { GeneralSettingsSkeleton } from '@/settings/general/components/GeneralSettingsSkeleton';
import SelectControl from '@/settings/general/components/SelectControl';
import { SelectCurrency } from '@/settings/general/components/SelectCurrency';
import { SelectMainCurrency } from '@/settings/general/components/SelectMainCurrency';
import { SelectTimezone } from '@/settings/general/components/SelectTimezone';
import { LANGUAGES } from '@/settings/general/constants/data';
import { useGeneralSettingsForms } from '@/settings/general/hooks/useGeneralSettingsForms';
import { TGeneralSettingsProps } from '@/settings/general/types';
import { Button, Form, Spinner, useToast } from 'erxes-ui';
import { useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useSwitchLanguage } from '~/i18n';

const GeneralSettings = () => {
  const { languages } = useSwitchLanguage();
  const { toast } = useToast();
  const {
    methods,
    methods: { control },
    handleLanguage,
  } = useGeneralSettingsForms();
  const { configs, updateConfig, loading, isLoading } = useConfig();

  const updateCurrency = (data: TGeneralSettingsProps) => {
    const updatedConfigs = {
      // start with all existing configs
      ...configs.reduce(
        (acc: Record<string, any>, config: TConfig) => {
          acc[config.code] = config.value;
          return acc;
        },
        {} as Record<string, any>,
      ),
      // override/add with new data
      ...data,
    };

    updateConfig(updatedConfigs);
  };

  const submitHandler: SubmitHandler<TGeneralSettingsProps> = (data) => {
    updateCurrency(data);

    handleLanguage(data.languageCode).then(() => {
      toast({
        title: 'Updated successfully',
        description: `Language switched to (${data.languageCode})`,
      });
    });
  };

  useEffect(() => {
    if (configs) {
      const currencies = configs?.find(
        (data: any) => data.code === 'dealCurrency',
      );
      const mainCurrency = configs?.find(
        (data: any) => data.code === 'mainCurrency',
      );

      const timezone = configs?.find((data: any) => data.code === 'TIMEZONE');

      methods.setValue('dealCurrency', currencies?.value);
      methods.setValue('mainCurrency', mainCurrency?.value);

      timezone && methods.setValue('TIMEZONE', timezone?.value);
    }
  }, [configs, methods]);

  if (loading) {
    return <GeneralSettingsSkeleton />;
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(submitHandler)}
        className="py-1 flex flex-col space-y-3"
      >
        <SelectControl
          control={control}
          name="languageCode"
          options={LANGUAGES.filter((lang) =>
            languages.some((lng) => lang.value === lng),
          )}
          placeholder="Languages"
          label="Language"
        />
        <SelectMainCurrency />
        <SelectCurrency />
        <SelectTimezone />
        <Button disabled={isLoading} type="submit" className="w-1/4 ml-auto">
          {isLoading ? (
            <Spinner className="stroke-white/90 w-4 h-4" />
          ) : (
            'Update'
          )}
        </Button>
      </form>
    </Form>
  );
};

export { GeneralSettings };
