import React from 'react'
import Preview from './Preview'
import { gql, useQuery } from "@apollo/client";
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

const Template = (props) => {

    const { componentType } = props

    const automationConstantsQuery = useQuery(gql(queries.automationConstants))
    const constants = automationConstantsQuery?.data?.automationConstants || {}

    if (automationConstantsQuery.loading) {
        return <Spinner objective={true} />
    }

    const finalProps = {
        ...props,
        constants
    }

    switch (componentType) {
        case 'preview':
            return <Preview {...finalProps} />
        default:
            return
    }
}

export default Template