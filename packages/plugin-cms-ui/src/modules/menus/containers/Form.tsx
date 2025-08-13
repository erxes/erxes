import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import { gql, useMutation } from '@apollo/client';
import { addMenu, editMenu } from '../graphql/mutations';
import Form from '../components/Form';

type Props = {
  menu?: any;
  closeModal: () => void;
};

const FormContainer: React.FC<Props> = (props) => {
  const { menu, closeModal } = props;
  const navigate = useNavigate();

  const [addMutation] = useMutation(gql(addMenu), {
    onCompleted: () => {
      closeModal();
      navigate('/cms/menus');
      Alert.success('Successfully added menu');
    },
    refetchQueries: ['cmsMenuList'],
  });

  const [editMutation] = useMutation(gql(editMenu), {
    onCompleted: () => {
      closeModal();
      navigate('/cms/menus');
      Alert.success('Successfully edited menu');
    },
    refetchQueries: ['cmsMenuList'],
  });

  const save = (doc: any) => {
    if (menu) {
      return editMutation({ variables: { ...doc } });
    }
    return addMutation({ variables: { ...doc } });
  };

  const updatedProps = {
    ...props,
    menu,
    save,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
