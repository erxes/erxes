import React from 'react'
import Form from '../../components/category/Form'
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { mutations } from '../../graphql';
import { generateOptions } from '../../../../ui-template/src/utils';
import { ITemplateCategory } from '@erxes/ui-template/src/types';

type Props = {
    type: any;
    category: ITemplateCategory;
    categories: any[];
    closeDrawer(): void;
}

const FormContainer = (props: Props) => {

    const { type, category: currentCategory, categories, closeDrawer } = props

    const renderButton = ({ text, values, isSubmitted, object }: IButtonMutateProps) => {
        const afterSave = (data) => {
            closeDrawer();
        };

        return (
            <ButtonMutate
                mutation={object ? mutations.categoryEdit : mutations.categoryAdd}
                variables={values}
                callback={afterSave}
                refetchQueries={['categoryList']}
                isSubmitted={isSubmitted}
                type="submit"
                uppercase={false}
                successMessage={`You successfully ${object ? 'updated' : 'added'} a ${text}`}
            />
        );
    };

    const list = (categories || []).filter(category => category.contentType === type && category._id !== currentCategory?._id && category.isRoot)
    const categoryOptions = generateOptions(list)

    const finalProps = {
        ...props,
        type,
        categoryOptions,

        renderButton
    }

    return (
        <Form {...finalProps} />
    )
}

export default FormContainer