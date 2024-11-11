import React from 'react'
import Form from '../components/Form'
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types'
import { gql, useQuery, useMutation } from "@apollo/client";
import { queries, mutations } from '../graphql';
import { generateOptions } from '../utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import { TemplateCategoryListQueryResponse } from '../types';

type Props = {
    mode: string;
    template?: any;

    contentType?: string;
    content?: string;
    serviceName?: string;

    closeDrawer(): void;
}

const FormContainer = (props: Props) => {

    const { contentType, content, serviceName, closeDrawer } = props

    const categoryListQueries = useQuery<TemplateCategoryListQueryResponse>(gql(queries.categoryList))

    const renderButton = ({ text, values, isSubmitted, object, }: IButtonMutateProps) => {
        const afterSave = (data) => {
            closeDrawer();
        }

        const variables = {
            ...values,
        }

        if (!object) {
            Object.assign(variables, {
                contentType: `${serviceName}:${contentType}`,
                content,
            })
        }

        return (
            <ButtonMutate
                mutation={object ? mutations.templateEdit : mutations.templateAdd}
                variables={variables}
                callback={afterSave}
                refetchQueries={['templateList']}
                isSubmitted={isSubmitted}
                type="submit"
                uppercase={false}
                successMessage={`You successfully ${object ? 'updated' : 'added'} a ${text}`}
            />
        );
    }

    const { list = [] } = categoryListQueries?.data?.categoryList || {}
    const categoryOptions = generateOptions(list)

    if (categoryListQueries?.loading) {
        return <Spinner />
    }

    const finalProps = {
        ...props,
        categoryOptions,

        renderButton
    }

    return (
        <Form {...finalProps} />
    )
}

export default FormContainer