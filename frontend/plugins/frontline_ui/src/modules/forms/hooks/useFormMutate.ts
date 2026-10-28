import { z } from 'zod';
import { useFormAdd } from './useFormAdd';
import { useFormEdit } from './useFormEdit';
import { useNavigate, useParams } from 'react-router';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  formSetupValuesAtom,
  resetFormSetupAtom,
} from '../states/formSetupStates';
import { FORM_CONFIRMATION_SCHEMA } from '../constants/formSchema';
import {
  FORM_BULK_ACTION,
  CRAETE_LEAD_INTEGRATION,
} from '../graphql/formMutations';
import { GET_FORMS_TOTAL_COUNT } from '@/forms/graphql/formQueries';
import { useMutation } from '@apollo/client';
import { isDefined, toast } from 'erxes-ui';
import { useFormDetail } from './useFormDetail';
import { useTranslation } from 'react-i18next';
import { useFormConversionTranslation } from '../conversionTranslations';

type FormField = {
  tempFieldId?: string;
  type?: string;
  expectedType?: string;
} & Record<string, unknown>;

const buildEditFieldsVariables = (
  id: string,
  formFields: FormField[],
  existingFields: { _id: string }[],
) => ({
  contentType: 'form',
  contentTypeId: id,
  updatedFields: formFields
    .filter((field) => existingFields.some((f) => f._id === field.tempFieldId))
    .map(({ tempFieldId, ...field }) => ({ ...field, _id: tempFieldId })),
  newFields: formFields.filter(
    (field) => !existingFields.some((f) => f._id === field.tempFieldId),
  ),
  removedFieldIds: existingFields
    .filter((f) => !formFields.some((field) => field.tempFieldId === f._id))
    .map((f) => f._id),
});

export const useFormMutate = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { errorMessage } = useFormConversionTranslation();
  const { formId: id, id: _channelId } = useParams();
  const navigate = useNavigate();
  const formSetupValues = useAtomValue(formSetupValuesAtom);
  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  const { formDetail } = useFormDetail({ formId: id as string });
  const { addForm, isAddingForm, client: addFormClient } = useFormAdd();
  const { editForm, loading: isEditingForm } = useFormEdit();
  const [createLeadIntegration, { loading: isCreatingIntegration }] =
    useMutation(CRAETE_LEAD_INTEGRATION);
  const [fieldsBulkAction, { loading: isFieldsBulkActionLoading }] =
    useMutation(FORM_BULK_ACTION);

  const handleMutateForm = async (
    confirmation: z.infer<typeof FORM_CONFIRMATION_SCHEMA>,
  ) => {
    const {
      formValues,
      formFields,
      channelId: selectedChannelId,
    } = formSetupValues(confirmation);
    const channelId =
      formDetail?.channelId || selectedChannelId || _channelId || '';

    try {
      if (id) {
        const fieldVariables = buildEditFieldsVariables(
          id,
          formFields,
          (formDetail?.fields ?? []).filter(isDefined),
        );
        const converting = fieldVariables.updatedFields.some(
          (field) => field.expectedType && field.expectedType !== field.type,
        );
        if (!converting)
          await editForm({
            variables: {
              ...formValues,
              id,
              integrationId: formDetail?.integrationId,
            },
          });
        await fieldsBulkAction({
          variables: {
            ...fieldVariables,
            ...(converting
              ? {
                  formChanges: {
                    ...formValues,
                    integrationId: formDetail?.integrationId,
                  },
                }
              : {}),
          },
        });
      } else {
        if (!channelId)
          throw new Error(
            t('channel-id-required', 'Channel ID is required to create a form'),
          );
        const integrationResult = await createLeadIntegration({
          variables: { name: formValues.name, channelId },
        });
        const integrationId =
          integrationResult.data?.integrationsCreateLeadIntegration?._id;
        const result = await addForm({
          variables: { ...formValues, channelId, integrationId },
          refetchQueries: [GET_FORMS_TOTAL_COUNT],
        });
        const formId = result.data?.formsAdd?._id;
        if (!formId)
          throw new Error(
            t('form-create-failed', 'Could not create the form.'),
          );
        await fieldsBulkAction({
          variables: {
            contentType: 'form',
            contentTypeId: formId,
            newFields: formFields,
          },
        });
      }

      await addFormClient?.refetchQueries({
        updateCache(cache) {
          for (const fieldName of [
            'forms',
            'formDetail',
            'formSubmissions',
            'formSubmissionDetail',
          ]) {
            cache.evict({ id: 'ROOT_QUERY', fieldName });
          }
        },
      });
      toast({
        title: t('success', 'Success!'),
        variant: 'success',
        description: id
          ? t('form-updated-successfully', 'Form updated successfully')
          : t('form-created-successfully', 'Form created successfully'),
      });
      resetFormSetup();
      navigate(
        _channelId
          ? `/frontline/settings/channels/${_channelId}/forms`
          : '/frontline/forms',
      );
    } catch (error) {
      toast({
        title: t('error', 'Error'),
        description:
          errorMessage(error) ??
          (error instanceof Error
            ? error.message
            : t('form-save-failed', 'Could not save the form.')),
        variant: 'destructive',
      });
    }
  };

  return {
    loading:
      isAddingForm ||
      isEditingForm ||
      isFieldsBulkActionLoading ||
      isCreatingIntegration,
    handleMutateForm,
  };
};
