import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList,
  Toggle,
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

  const statusOptions = [
    { value: 'draft', label: __('Draft') },
    { value: 'published', label: __('Published') },
    { value: 'scheduled', label: __('Scheduled') },
  ];

  React.useEffect(() => {
    if (post._id) {
      statusOptions.push({ value: 'archive', label: __('Archive') });
    }
  }, [post._id]);

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || '-'}</SidebarCounter>
      </li>
    );
  };

  return (
    <Box title={__('Post')} name='main' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <li>
              <div style={{ width: '100%' }}>
                <FormGroup>
                  <FormControl
                    hideBottomBorder={true}
                    inline={true}
                    name={'post_title'}
                    type={'input'}
                    required={true}
                    placeholder='Post title'
                    value={post.title || ''}
                    onChange={(e: any) => {
                      onChange('title', e.target.value);
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Featured</ControlLabel>
                  <p>Turn this post into a featured post</p>
             
                    <Toggle
                      id='saveAsCustomer'
                      checked={post.featured || false}
                      onChange={(e: any) => {
                        onChange('featured', e.target.checked);
                      }}
                      icons={{
                        checked: <span>Yes</span>,
                        unchecked: <span>No</span>,
                      }}
                    />
                  <hr/>
                </FormGroup>
                <FormGroup>
                  <ControlLabel required={true} uppercase={false}>
                    {__('Status')}
                  </ControlLabel>
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

                      onChange('isScheduled', values.isScheduled);
                      onChange('scheduledDate', values.scheduledDate);
                      onChange('status', e.target.value);
                    }}
                  >
                    {statusOptions.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
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
