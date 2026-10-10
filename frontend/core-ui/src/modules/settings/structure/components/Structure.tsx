import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  Input,
  PhoneInput,
  ScrollArea,
  Spinner,
  Textarea,
} from 'erxes-ui';
import {
  useAddStructureDetail,
  useEditStructureDetail,
  useStructureDetails,
} from '../hooks/useStructureDetails';
import { useStructureDetailsForm } from '../hooks/useStructureDetailsForm';
import { StructureDetailsFormT } from '../types/structure';
import { Can, SelectMember } from 'ui-modules';

export const Structure = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    structureDetail,
    loading: detailsLoading,
    error,
  } = useStructureDetails();
  const {
    methods,
    methods: { control, handleSubmit },
  } = useStructureDetailsForm(structureDetail);
  const { handleEdit, loading } = useEditStructureDetail();
  const { handleAdd, loading: isLoading } = useAddStructureDetail();

  const onSubmit = (data: StructureDetailsFormT) => {
    if (!structureDetail?._id) {
      return handleAdd({ variables: data });
    }
    return handleEdit({ variables: { ...data, id: structureDetail._id } });
  };

  if (detailsLoading) return <Spinner />;
  if (error)
    return (
      <div role="alert" className="text-destructive">
        {t('error-loading-structure', {
          message: error.message,
        })}
      </div>
    );

  return (
    <ScrollArea className="w-full min-h-svh">
      <div className="w-full overflow-hidden flex flex-col">
        <div className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">
            {t('structure')}
          </h2>
          <Form {...methods}>
            <form
              className="grid grid-cols-2 gap-3"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Form.Field
                control={control}
                name={'title'}
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>{t('name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'description'}
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Textarea {...field} rows={10} className="resize-none" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'supervisorId'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('supervisor')}</Form.Label>
                    <SelectMember.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('select-supervisor')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'code'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('code')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'phoneNumber'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('phone-number')}</Form.Label>
                    <Form.Control>
                      <PhoneInput
                        {...field}
                        key={`${structureDetail?._id ?? ''}:${
                          structureDetail?.phoneNumber ?? ''
                        }`}
                        value={structureDetail?.phoneNumber ?? ''}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'email'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control>
                      <Input {...field} type="email" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Can action="structuresManage">
                <Button
                  disabled={loading || isLoading}
                  className="w-1/2 ml-auto col-start-2"
                  type="submit"
                >
                  {t('update')}
                </Button>
              </Can>
            </form>
          </Form>
        </div>
      </div>
    </ScrollArea>
  );
};
