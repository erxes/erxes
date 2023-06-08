import Alert from '@erxes/ui/src/utils/Alert';
import { getEnv } from '@erxes/ui/src/utils/core';
import React from 'react';
import SalaryForm from '../../components/salary/Form';
// import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
  successCallback: () => void;
};

const FormContainer = (props: Props) => {
  const handleSubmit = (title: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const { REACT_APP_API_URL } = getEnv();

    fetch(`${REACT_APP_API_URL}/pl:bichil/upload-salary`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
      .then(res => res.json())
      .then(res => {
        if (!res.error) {
          Alert.success('Successfully uploaded');
          props.successCallback();
        } else {
          Alert.error(res.error);
        }

        props.closeModal();
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    handleSubmit
  };

  return <SalaryForm {...updatedProps} />;
};

// const getRefetchQueries = () => {
//   return [
//     {
//       query: gql(queries.listQuery),
//       fetchPolicy: 'network-only'
//     }
//   ];
// };

export default FormContainer;
