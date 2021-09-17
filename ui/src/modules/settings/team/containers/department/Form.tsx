import React from 'react'
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import Form from '../../components/department/Form'
import { mutations } from '../../graphql'

type Props = {
    department?: any;
    closeModal: () => void;
}

const FormContainer = (props: Props) => {
    const renderButton = ({
        name,
        values,
        isSubmitted,
        object
      }: IButtonMutateProps) => {

      return (
        <ButtonMutate
            mutation={object._id ? mutations.departmentsEdit : mutations.departmentsAdd}
            variables={values}
            isSubmitted={isSubmitted}
            type="submit"
            successMessage={`You successfully ${
                object._id ? 'updated' : 'added'
            } a ${name}`}
        />);
    };

    return <Form {...props} renderButton={renderButton} />
}

export default FormContainer;