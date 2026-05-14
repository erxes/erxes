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
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useFormDetail } from './useFormDetail';

export const useFormMutate = () => {
  const { formId: id, id: channelId } = useParams();
  const navigate = useNavigate();
  const formSetupValues = useAtomValue(formSetupValuesAtom);
  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  const { formDetail } = useFormDetail({ formId: id as string });
  const { addForm, isAddingForm, client: addFormClient } = useFormAdd();
  const { editForm, loading: isEditingForm } = useFormEdit();
  const [createLeadIntegration, { loading: isCreatingIntegration }] =
    useMutation<{ integrationsCreateLeadIntegration: { _id: string } }>(
      CRAETE_LEAD_INTEGRATION,
      {
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      },
    );

  const [fieldsBulkAction, { loading: isFieldsBulkActionLoading }] =
    useMutation(FORM_BULK_ACTION, {
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

  const handleMutateForm = async (
    confirmation: z.infer<typeof FORM_CONFIRMATION_SCHEMA>,
  ) => {
    const { formValues, formFields } = formSetupValues(confirmation);
    if (id) {
      await editForm({
        variables: {
          ...formValues,
          id,
          integrationId: formDetail?.integrationId,
        },
        onCompleted: () => {
          fieldsBulkAction({
            variables: {
              contentType: 'form',
              contentTypeId: id,
              updatedFields: formFields
                .filter((field) =>
                  formDetail?.fields.some((f) => f._id === field.tempFieldId),
                )
                .map(({ tempFieldId, ...field }) => ({
                  ...field,
                  _id: tempFieldId,
                })),
              newFields: formFields.filter(
                (field) =>
                  !formDetail?.fields.some((f) => f._id === field.tempFieldId),
              ),
            },
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      if (!channelId) {
        toast({
          variant: 'destructive',
          title: 'Channel ID is required to create a form',
        });
        return;
      }
      const integrationResult = await createLeadIntegration({
        variables: { name: formValues.name, channelId },
      });
      const integrationId =
        integrationResult.data?.integrationsCreateLeadIntegration._id;
      await addForm({
        variables: { ...formValues, channelId, integrationId },
        onCompleted: ({ formsAdd }) => {
          fieldsBulkAction({
            variables: {
              contentType: 'form',
              contentTypeId: formsAdd._id,
              newFields: formFields,
            },
          });
          addFormClient?.cache.evict({ fieldName: 'Forms' });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    }
    resetFormSetup();
    navigate(`/settings/frontline/channels/${channelId}/forms`);
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
