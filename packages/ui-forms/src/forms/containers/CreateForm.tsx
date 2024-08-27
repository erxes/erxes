import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src/components';
import { Alert } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';

import Form from '../components/Form';
import { mutations } from '../graphql';
import { queries } from '@erxes/ui-settings/src/general/graphql';

import { IFormData } from '../types';
import { IField } from '@erxes/ui/src/types';
import { ConfigsQueryResponse } from '@erxes/ui-settings/src/general/types';

type Props = {
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  formData?: IFormData;
  type: string;
  isReadyToSave: boolean;
  showMessage?: boolean;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
};

const CreateFormContainer: React.FC<Props> = ({
  afterDbSave,
  showMessage = true,
  ...props
}) => {
  const { data: configsData, loading: configsLoading } =
    useQuery<ConfigsQueryResponse>(gql(queries.configs));

  const [addFormMutation] = useMutation(gql(mutations.addForm), {
    refetchQueries: ['fields'],
  });

  const [fieldsBulkAddAndEditMutation] = useMutation(
    gql(mutations.fieldsBulkAddAndEdit)
  );

  const saveForm = useCallback(
    (doc: IFormData) => {
      let formId: string;
      const {
        title,
        description,
        buttonText,
        fields = [],
        type,
        numberOfPages,
      } = doc;

      addFormMutation({
        variables: {
          title,
          description,
          buttonText,
          type: type || 'lead',
          numberOfPages: Number(numberOfPages),
        },
      })
        .then(({ data }) => {
          if (data) {
            formId = data.formsAdd._id;
            afterDbSave(formId);
          }
        })
        .then(() => {
          const cleanedFields = fields.map(({ _id, ...rest }) => ({
            tempFieldId: _id,
            ...rest,
          }));

          fieldsBulkAddAndEditMutation({
            variables: {
              contentType: 'form',
              contentTypeId: formId,
              addingFields: cleanedFields,
            },
          });
        })
        .then(() => {
          if (showMessage) {
            Alert.success('You successfully added a form');
          }
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    },
    [addFormMutation, fieldsBulkAddAndEditMutation, afterDbSave, showMessage]
  );

  console.log("configsLoading",configsLoading)

  if (configsLoading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    fields: [],
    configs: configsData?.configs || [],
    saveForm,
  };

  return <Form {...updatedProps} />;
};

export default CreateFormContainer;
