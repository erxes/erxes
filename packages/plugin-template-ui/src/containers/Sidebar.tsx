import React from 'react'
import Sidebar from '../components/Sidebar';
import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { gql, useQuery, useMutation } from "@apollo/client";
import { queries, mutations } from "../graphql";
import { TemplateCategoryListQueryResponse, TemplateCategoryRemoveMutationResponse } from '@erxes/ui-template/src/types';

type Props = {
    location: any;
    navigate: any;
    queryParams?: any;

    toggleSidebar: boolean
}

const SidebarContainer = (props: Props) => {

    const { toggleSidebar } = props

    const templateTypesQuery = useQuery(gql(queries.templatesGetTypes))
    const categoryListQueries = useQuery<TemplateCategoryListQueryResponse>(gql(queries.categoryList))

    const [categoryRemove] = useMutation<TemplateCategoryRemoveMutationResponse>(gql(mutations.categoryRemove), {
        refetchQueries: [
            {
                query: gql(queries.categoryList)
            }
        ]
    })

    const removeCategory = (_id: string) => {
        confirm("Are you sure to delete selected category?").then(() => {
            categoryRemove({
                variables: { _id },
            })
                .then(() => {
                    Alert.success("You successfully deleted a category");
                })
                .catch((e) => {
                    Alert.error(e.message);
                });
        });
    }

    const templateTypes = templateTypesQuery?.data?.templatesGetTypes || []

    const { list = [] } = categoryListQueries?.data?.categoryList || {}

    const finalProps = {
        ...props,
        templateTypes,

        categories: list,
        removeCategory
    }

    if (!toggleSidebar) {
        return <></>
    }

    return (
        <Sidebar {...finalProps} />
    )
}

export default SidebarContainer