import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations as formMutations } from '@erxes/ui-forms/src/forms/graphql';
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mutations from '../../mutations';
import queries from '../../queries';
import { ILeadData } from '../../types';
import Lead from '../components/LeadForm';
import { Alert } from '../../../common/utils';

type State = {
  isLoading: boolean;
  isReadyToSaveForm: boolean;
  isIntegrationSubmitted: boolean;
  formId?: string;
  mustWait?: any;
  doc?: {
    brandId: string;
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
    channelIds?: string[];
  };
};

const CreateLeadContainer: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    isLoading: false,
    isReadyToSaveForm: false,
    isIntegrationSubmitted: false,
    mustWait: { optionsStep: false },
  });
  const [id, setId] = useState('');

  const { data: emailTemplatesTotalCountData } = useQuery(
    gql(queries.templateTotalCount),
    {
      skip: !isEnabled('engages'),
    },
  );

  const { data: emailTemplatesData } = useQuery(gql(queries.emailTemplates), {
    skip: !isEnabled('engages') || !emailTemplatesTotalCountData,
    variables: {
      perPage: emailTemplatesTotalCountData?.emailTemplatesTotalCount || 0,
    },
  });

  const { data: configsData } = useQuery<ConfigsQueryResponse>(
    gql(settingsQueries.configs),
  );

  const [addIntegrationMutation] = useMutation(
    gql(mutations.integrationsCreateLeadIntegration),
  );

  const [addFormMutation] = useMutation(gql(formMutations.addForm));
  const [manageFieldsMutation] = useMutation(
    gql(formMutations.fieldsBulkAction),
  );

  const redirect = () => {
    let canClose = true;

    for (const key in state.mustWait) {
      if (state.mustWait[key]) {
        canClose = false;
        break;
      }
    }

    if (canClose) {
      navigate({
        pathname: '/forms',
        search: `?popUpRefetchList=true&showInstallCode=${id}`,
      });
    }
  };

  const save = async (doc) => {
    const { formData } = doc;
    const { fields = [] } = formData;

    let integrationResult: any;
    if (isEnabled('inbox')) {
      integrationResult = await addIntegrationMutation({
        variables: {
          brandId: doc.brandId,
          channelIds: doc.channelIds,
          name: doc.name,
        },
      });
    }

    addFormMutation({
      variables: {
        type: 'lead',
        name: doc.name,
        title: formData.title,
        description: formData.description,
        buttonText: formData.buttonText,
        numberOfPages: parseInt(formData.numberOfPages || 0),
        visibility: doc.visibility,
        leadData: doc.leadData,
        languageCode: doc.languageCode,
        departmentIds: doc.departmentIds,
        brandId: doc.brandId,
        integrationId:
          integrationResult?.data?.integrationsCreateLeadIntegration?._id,
      },
    }).then(({ data }) => {
      const formId = data?.formsAdd._id;

      setState({ ...state, doc, isReadyToSaveForm: true, isLoading: false });
      setId(formId);

      if (fields.length > 0) {
        const cleanedFields = fields.map(({ _id, ...rest }) => {
          const f: any = rest;

          delete f.contentType;

          return {
            tempFieldId: _id,
            ...f,
          };
        });

        manageFieldsMutation({
          variables: {
            contentType: 'form',
            contentTypeId: formId,
            newFields: cleanedFields,
          },
        });
      }

      Alert.success('You successfully added a form');

      navigate({
        pathname: '/forms/leads',
        search: `?popUpRefetchList=true&showInstallCode=${formId}`,
      });
    });
  };

  const updatedProps = {
    fields: [],
    save,
    isActionLoading: state.isLoading,
    isReadyToSaveForm: state.isReadyToSaveForm,
    isIntegrationSubmitted: state.isIntegrationSubmitted,
    emailTemplates: emailTemplatesData?.emailTemplates || [],
    configs: configsData?.configs || [],
  };

  return <Lead {...updatedProps} currentMode="create" />;
};

export default CreateLeadContainer;
