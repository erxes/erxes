import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import DirectionForm from '../../components/directions/Form';
import { mutations, queries } from '../../graphql';
import { useQuery, useMutation } from 'react-apollo';
import Alert from '@erxes/ui/src/utils/Alert';
import { IDirection } from '../../types';

type Props = {
  direction?: IDirection;
  closeModal: () => void;
};

const DirectionFormContainer = (props: Props) => {
  const direction = props.direction;
  const { data } = useQuery(gql(queries.placesQuery), {
    fetchPolicy: 'network-only',
    variables: { perPage: 9999 }
  });

  const [editMutation] = useMutation(gql(mutations.editDirection));

  const onGetDirections = (overviewPath: any[]) => {
    if (!direction) {
      return;
    }

    editMutation({ variables: { _id: direction._id, overviewPath } })
      .then(() => {
        Alert.success('Successfully edited');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editDirection : mutations.addDirection}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a direction`}
      />
    );
  };

  const updatedProps = {
    ...props,
    places: (data && data.places.list) || [],
    onGetDirections,
    renderButton
  };

  return <DirectionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.directions)
    }
  ];
};

export default DirectionFormContainer;
