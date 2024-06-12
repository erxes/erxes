import React from 'react'
import { gql, useQuery, useMutation } from "@apollo/client";
import { queries, mutations } from "../graphql";
import Preview from '../components/Preview';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
    template: any;
}

const PreviewContainer = (props: Props) => {

    const { template } = props

    const templateContent = JSON.parse(template.content)

    const finalProps = {
        template: templateContent,
        type: template.contentType
    }

    return (
        <Preview {...finalProps} />
    )
}

export default PreviewContainer