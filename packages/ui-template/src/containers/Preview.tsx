import React from 'react'
import Preview from '../components/Preview';
import { ITemplate } from '../types';

type Props = {
    template?: ITemplate;
}

const PreviewContainer = (props: Props) => {
    const { template } = props

    if (!template) {
        return <></>
    }

    const templateContent = JSON.parse(template?.content)

    const finalProps = {
        template: templateContent,
        type: template?.contentType
    }

    return (
        <Preview {...finalProps} />
    )
}

export default PreviewContainer