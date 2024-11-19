import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src';
import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Box from '@erxes/ui/src/components/Box';

type Props = {
  post: any;
  onChange: (field: string, value: any) => void;
};

const TripSection = (props: Props) => {
  const { Section } = Sidebar;
  const { post, onChange } = props;

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  return (
    <Box title={__('Info')} name='main' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <li>
              <div style={{width: '100%'}}>
              <FormGroup>
                <ControlLabel required={true} uppercase={false}>{__('Status')}</ControlLabel>
                <FormControl
                  name='status'
                  componentclass='select'
                  placeholder={__('Select')}
                  defaultValue={post.status || 'draft'}
                  required={true}
                  onChange={(e: any) => {
                    const values: {
                      isScheduled: boolean;
                      scheduledDate?: Date;
                    } = {
                      isScheduled: false,
                      scheduledDate: undefined,
                    };
                    if (e.target.value === 'scheduled') {
                      values.isScheduled = true;
                      values.scheduledDate = new Date();
                    }

                    onChange('status', e.target.value);
                    onChange('isScheduled', values.isScheduled);
                    onChange('scheduledDate', values.scheduledDate);
                  }}
                >
                  {[
                    { value: 'draft' },
                    { value: 'scheduled' },
                    { value: 'publish' },
                    { value: 'archive' },
                  ].map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.value}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              </div>
            </li>
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Box>
  );
};

export default TripSection;
