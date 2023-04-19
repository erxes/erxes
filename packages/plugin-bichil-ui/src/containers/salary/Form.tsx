import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';
import SalaryForm from '../../components/salary/Form';
import { getEnv } from '@erxes/ui/src/utils/core';
// import { mutations, queries } from '../graphql';

type Props = {
  closeModal: () => void;
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
      .then(_response => {
        props.closeModal();
      })
      .catch(error => {
        console.log(error);
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
