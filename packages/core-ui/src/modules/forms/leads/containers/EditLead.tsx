import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations as formMutations } from '@erxes/ui-forms/src/forms/graphql';
import { IForm } from '@erxes/ui-forms/src/forms/types';
import {
  IIntegration,
  LeadIntegrationDetailQueryResponse,
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { queries as settingsQueries } from '@erxes/ui-settings/src/general/graphql';
import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';
import { Alert } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../../common/components/Spinner';
import mutations from '../../mutations';
import queries from '../../queries';
import { ILeadData } from '../../types';
import Lead from '../components/LeadForm';

type Props = {
  formId: string;
  queryParams: any;
};

const EditLeadContainer = ({ queryParams, formId }: Props) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyToSaveForm, setIsReadyToSaveForm] = useState(false);
  const [mustWait, setMustWait] = useState({ optionsStep: false });
  const [isIntegrationSubmitted, setIsIntegrationSubmitted] = useState(false);
  const [shouldFetchIntegration, setShouldFetchIntegration] = useState(false);

  const [doc, setDoc] = useState<{
    brandId: string;
    channelIds?: string[];
    name: string;
    languageCode: string;
    lead: any;
    leadData: ILeadData;
    visibility?: string;
    departmentIds?: string[];
  }>({} as any);

  

  const { data: formDetailData, loading: formLoading } = useQuery(
    gql(queries.formDetail),
    {
      variables: { id: formId },
      fetchPolicy:'network-only'
    }
  );

  useEffect(() => {
    if (formDetailData?.formDetail?.integrationId) {
      setShouldFetchIntegration(true);
    } 
  }, [formDetailData]);

  const { data: integrationDetailData, loading: integrationLoading } =
  useQuery<LeadIntegrationDetailQueryResponse>(
    gql(queries.integrationDetail),
    {
      variables: { _id: formDetailData?.formDetail?.integrationId },
      fetchPolicy: 'cache-and-network',
      skip: !shouldFetchIntegration || !isEnabled('inbox'),
    }
);

  const {
    data: emailTemplatesTotalCountData,
    loading: emailTemplatesTotalCountLoading,
  } = useQuery(gql(queries.templateTotalCount), {
    skip: !isEnabled('engages'),
  });

  const { data: emailTemplatesData, loading: emailTemplatesLoading } = useQuery(
    gql(queries.emailTemplates),
    {
      skip: !isEnabled('engages') || !emailTemplatesTotalCountData,
      variables: {
        perPage: emailTemplatesTotalCountData?.emailTemplatesTotalCount || 0,
      },
    }
  );

  const { data: configsData } = useQuery<ConfigsQueryResponse>(
    gql(settingsQueries.configs)
  );

  const [editFormMutation] = useMutation(gql(formMutations.editForm), {
    refetchQueries: ['formDetail'],
  });

  const [editIntegrationMutation] = useMutation(
    gql(mutations.integrationsEditLeadIntegration),
    {
      refetchQueries: [
        'leadIntegrations',
        'leadIntegrationCounts',
        'formDetail',
      ],
    }
  );

  const [manageFieldsMutation] = useMutation(
    gql(formMutations.fieldsBulkAction)
  );

  const [addIntegrationMutation] = useMutation(
    gql(mutations.integrationsCreateLeadIntegration)
  );

  const [removeFieldMutation] = useMutation(gql(formMutations.fieldsRemove));

  useEffect(() => {
    if (Object.keys(doc).length > 0) {
      afterFormDbSave();
    }
  }, [doc]);

  const redirect = () => {
    let canClose = true;

    for (const key in mustWait) {
      if (mustWait[key]) {
        canClose = false;
      }
    }

    if (canClose) {
      navigate({
        pathname: '/forms',
        search: `?popUpRefetchList=true`,
      });
    }
  };

  if (
    formLoading ||
    integrationLoading ||
    emailTemplatesLoading ||
    emailTemplatesTotalCountLoading
  ) {
    return <Spinner />;
  }

  const integration =
    integrationDetailData?.integrationDetail || ({} as IIntegration);

  const dbFields = formDetailData?.formDetail.fields || [];

  const afterFormDbSave = () => {
    const {
      leadData,
      brandId,
      name,
      languageCode,
      channelIds,
      visibility,
      departmentIds,
    } = doc;

    editIntegrationMutation({
      variables: {
        _id: integration._id,
        formId,
        leadData,
        brandId,
        name,
        languageCode,
        channelIds,
        visibility,
        departmentIds,
      },
    })
      .then(() => {
        Alert.success('You successfully updated a form');

        setIsIntegrationSubmitted(true);
        redirect();
      })
      .catch((error) => {
        Alert.error(error.message);

        setIsReadyToSaveForm(false);
        setIsLoading(false);
      });
  };

  const waitUntilFinish = (obj: any) => {
    const mustWaitObj = { ...mustWait, ...obj };
    setMustWait(mustWaitObj);
  };

  const save = (doc) => {
    const { formData } = doc;
    let { fields = [] } = formData;

    editFormMutation({
      variables: {
        _id: formId,
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
      },
    })
      .then(({ data }) => {
        const dbFieldIds = dbFields.map((field) => field._id);
        const existingIds: string[] = [];
        const removeFieldsData: Array<{ _id: string }> = [];

        fields = fields.map((f) => {
          const { contentType, associatedField, __typename, ...rest } = f;
          const logics = f.logics?.map(({ __typename: t, ...l }) => l);
          delete rest.contentType;
          delete rest.contentTypeId;

          const objectListConfigs = f.objectListConfigs?.map(
            ({ __typename: t, ...config }) => config
          );
          return { ...rest, logics, objectListConfigs };
        });

        const newFields = fields
          .filter((field) => field._id.startsWith('tempId'))
          .map(({ _id, ...rest }) => {
            delete rest.contentType;
            delete rest.contentTypeId;

            return {
              tempFieldId: _id,
              ...rest,
            };
          });

        const updatedFields = fields.filter(
          (field) => !field._id.startsWith('tempId')
        );

        // collect fields ================
        for (const field of fields) {
          // collect fields to update
          if (dbFieldIds.includes(field._id)) {
            existingIds.push(field._id);
            continue;
          }
        }

        // collect fields to remove
        for (const dbFieldId of dbFieldIds) {
          if (!existingIds.includes(dbFieldId || '')) {
            removeFieldsData.push({ _id: dbFieldId || '' });
          }
        }

        manageFieldsMutation({
          variables: {
            contentType: 'form',
            contentTypeId: formId,
            newFields,
            updatedFields,
          },
        });

        if (isEnabled('inbox')) {
          if (!integrationDetailData) {
            addIntegrationMutation({
              variables: {
                brandId: doc.brandId,
                formId,
                channelIds: doc.channelIds,
                name: doc.name,
              },
            });
          } else {
            editIntegrationMutation({
              variables: {
                _id: integration._id,
                brandId: doc.brandId,
                formId,
                channelIds: doc.channelIds,
                name: doc.name,
              },
            });
          }
        }

        const promises: any[] = [];

        const doMutation = ({ datas, mutation }) => {
          for (const data of datas) {
            promises.push(mutation({ variables: data }));
          }
        };

        doMutation({
          datas: removeFieldsData,
          mutation: removeFieldMutation,
        });

        return Promise.all(promises);
      })
      .then(() => {
        Alert.success('You successfully added a form');

        navigate({
          pathname: '/forms/leads',
          search: `?popUpRefetchList=true&showInstallCode=${formId}`,
        });
      });
  };

  const updatedProps = {
    formId,
    integration: integration || ({} as any),
    form: formDetailData?.formDetail || ({} as IForm),
    integrationId: integration._id,
    save,
    afterFormDbSave,
    waitUntilFinish,
    onChildProcessFinished: (component) => {
      if (mustWait.hasOwnProperty(component)) {
        const mustWaitObj = { ...mustWait };
        mustWait[component] = false;
        setMustWait(mustWaitObj);
      }
      redirect();
    },
    isActionLoading: isLoading,
    isReadyToSaveForm: isReadyToSaveForm,
    isIntegrationSubmitted: isIntegrationSubmitted,
    emailTemplates: emailTemplatesData?.emailTemplates || [],
    configs: configsData?.configs || [],
  };

  return <Lead {...updatedProps} currentMode='update' />;
};

export default EditLeadContainer;
