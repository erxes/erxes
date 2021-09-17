import React, { useState } from 'react';

import Box from 'modules/common/components/Box';
import { SidebarList } from 'modules/layout/styles';
import Icon from 'modules/common/components/Icon';
import Collapse from 'react-bootstrap/Collapse';
import { __ } from 'modules/common/utils';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from './Form'

type Props = {
    listQuery: any
}

export default function List({ listQuery }: Props) {
    const [isBoxVisible, setIsBoxVisibile] = useState(true);

    const toggleBox = e => {
        e.preventDefault();
    
        setIsBoxVisibile(!isBoxVisible);
      };


    const renderForm = formProps => {
        return <Form {...formProps} />
    }
    
    const trigger = (
        <a href="#settings" tabIndex={0} onClick={toggleBox}>
            <Icon icon="plus" size={10} />
        </a>
    );

    const extraButtons = (
        <ModalTrigger
            content={renderForm}
            title="Add a department"
            trigger={trigger}
        />
    )
    
    return (
        <Box
            title={__('Departments')}
            name="showTags"
            extraButtons={extraButtons}
        >
          <Collapse in={isBoxVisible}>
            <SidebarList className="no-link">
                {(listQuery.departments || []).map(item => <li key={item._id}>{item.title}</li>)}
            </SidebarList>
            </Collapse>
        </Box>
    )
}