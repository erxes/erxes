import React from 'react'
import { PreviewWrapper } from '@erxes/ui-template/src/styles'
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';

type Props = {
    template: any;
    type: string;
}

const Preview = (props: Props) => {

    const { template, type } = props

    const renderDynamicComponent = () => {
        const plugins: any[] = (window as any).plugins || []

        for (const plugin of plugins) {
            if (type.includes(`${plugin.name}:`) && plugin.template) {
                return (
                    <RenderDynamicComponent
                        scope={plugin.scope}
                        component={plugin.template}
                        injectedProps={{
                            template,
                            componentType: 'preview'
                        }}
                    />
                )
            }
        }
    }

    return (
        <PreviewWrapper>{renderDynamicComponent()}</PreviewWrapper>
    )
}

export default Preview