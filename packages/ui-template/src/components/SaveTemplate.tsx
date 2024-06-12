import React, { useState } from 'react'
import { RightDrawerContainer } from '../styles';
import { Transition } from '@headlessui/react';
import Button from '@erxes/ui/src/components/Button';
import Form from '../containers/Form';

type Props = {
    contentType: string;
    content: any;
    serviceName: string;
}

const SaveTemplate = (props: Props) => {
    const [toggleDrawer, setToggleDrawer] = useState(false)

    const closeDrawer = () => {
        setToggleDrawer(false)
    }

    const handleClick = () => {
        setToggleDrawer(!toggleDrawer)
    }

    const renderForm = () => {

        const finalProps = {
            ...props,
            mode: "edit",
            closeDrawer
        }

        return (
            <Form {...finalProps} />
        )
    }

    return (
        <>
            <Button
                size='small'
                onClick={handleClick}
            >
                Save as Template
            </Button>

            <Transition
                show={toggleDrawer}
                className="slide-in-right"
            >
                <RightDrawerContainer>
                    {renderForm()}
                </RightDrawerContainer>
            </Transition>
        </>
    )
}

export default SaveTemplate