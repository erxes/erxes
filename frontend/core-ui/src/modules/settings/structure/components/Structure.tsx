import {
  Button,
  Form,
  Input,
  PhoneInput,
  ScrollArea,
  Textarea,
} from 'erxes-ui';
import {
  useAddStructureDetail,
  useEditStructureDetail,
  useStructureDetails,
} from '../hooks/useStructureDetails';
import { useStructureDetailsForm } from '../hooks/useStructureDetailsForm';
import { useEffect } from 'react';
import { Can, SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const Structure = () => {
  const { t } = useTranslation('settings');
  const { structureDetail } = useStructureDetails();
  const {
    methods,
    methods: { control, handleSubmit },
  } = useStructureDetailsForm();
  const { handleEdit, loading } = useEditStructureDetail();
  const { handleAdd, loading: isLoading } = useAddStructureDetail();

  useEffect(() => {
    if (!structureDetail?._id) return;

    const isEmpty = Object.keys(structureDetail).length === 0;

    if (isEmpty) {
      methods.reset();
    } else {
      methods.reset(structureDetail);
    }
  }, [structureDetail?._id]);

  const onSubmit = (data: any) => {
    const variables = {
      title: data.title,
      description: data.description,
      supervisorId: data.supervisorId,
      code: data.code,
      phoneNumber: data?.phoneNumber || '',
      email: data?.email || '',
    };

    if (!structureDetail?._id) {
      handleAdd({ variables });
      return;
    }

    handleEdit({ variables: { ...variables, id: structureDetail._id } }, [
      'title',
      'description',
      'supervisorId',
      'code',
      'phoneNumber',
      'email',
    ]);
  };

  return (
    <ScrollArea className="w-full min-h-svh">
      <div className="w-full overflow-hidden flex flex-col">
        <div className="mx-auto max-w-2xl w-full relative">
          <h2 className="font-semibold text-lg mt-4 mb-12 px-4">{t('structure', 'Structure')}</h2>
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
                    <Form.Label>{t('name', 'Name')}</Form.Label>
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
                    <Form.Label>{t('description', 'Description')}</Form.Label>
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
                    <Form.Label>{t('supervisor', 'Supervisor')}</Form.Label>
                    <SelectMember.FormItem
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('structure-select-supervisor', 'Select supervisor')}
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
                    <Form.Label>{field.name}</Form.Label>
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
                    <Form.Label>{t('phone-number', 'Phone number')}</Form.Label>
                    <Form.Control>
                      <PhoneInput {...field} />
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
                    <Form.Label>{t('email', 'Email')}</Form.Label>
                    <Form.Control>
                      <Input {...field} type="email" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {/* <Form.Field
                control={control}
                name={'coordinate.longitude'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{'longitude'}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name={'coordinate.latitude'}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{'latitude'}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              /> */}
              <Can action="structuresManage">
                <Button
                  disabled={loading || isLoading}
                  className="w-1/2 ml-auto col-start-2"
                  type="submit"
                >
                  {t('update', 'Update')}
                </Button>
              </Can>
            </form>
          </Form>
        </div>
      </div>
    </ScrollArea>
  );
};
