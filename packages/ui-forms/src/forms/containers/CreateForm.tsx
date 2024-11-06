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
  isAviableToSaveWhenReady?: boolean;
  isReadyToSave: boolean;
  showMessage?: boolean;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
  fieldTypes?: string[];
  name?: string;
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

  const [manageFieldsMutation] = useMutation(gql(mutations.fieldsBulkAction));

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
          name: props.name,
        },
      })
        .then(({ data }) => {
          if (data) {
            formId = data.formsAdd._id;
            afterDbSave(formId);
          }
        })
        .then(() => {
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
        })
        .then(() => {
          if (showMessage) {
            Alert.success('You successfully added a form');
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    },
    [addFormMutation, manageFieldsMutation, afterDbSave, showMessage]
  );

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
