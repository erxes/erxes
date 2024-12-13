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
import dayjs from 'dayjs';

type Props = {
  post: any;
  onChange: (field: string, value: any) => void;
};

const TripSection = (props: Props) => {
  const { Section } = Sidebar;
  const { post, onChange } = props;
  const [autoArchiveEnabled, setAutoArchiveEnabled] = React.useState(false);

  const formatDate = (date: Date) => {
    let day = dayjs(date || new Date());

    return day.format('YYYY-MM-DD HH:mm');
  };

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
                    id='featured'
                    checked={post.featured || false}
                    onChange={(e: any) => {
                      onChange('featured', e.target.checked);
                    }}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>,
                    }}
                  />
                  <hr />
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
                {post.status === 'published' && (
                  <FormGroup>
                    <ControlLabel>{__('Published date')}</ControlLabel>
                    <FormControl
                      name='publishedDate'
                      type='datetime-local'
                      defaultValue={formatDate(post.publishedDate)}
                      onChange={(e: any) => {
                        onChange('publishedDate', e.target.value);
                      }}
                    />
                  </FormGroup>
                )}
                {post.status === 'scheduled' && (
                  <FormGroup>
                    <ControlLabel>{__('Scheduled date')}</ControlLabel>
                    <FormControl
                      name='scheduledDate'
                      type='datetime-local'
                      defaultValue={formatDate(post.scheduledDate)}
                      onChange={(e: any) => {
                        onChange('scheduledDate', e.target.value);
                      }}
                    />
                  </FormGroup>
                )}

                {['scheduled', 'published'].includes(post.status) && (
                  <FormGroup>
                    <ControlLabel>Enable auto archive</ControlLabel>

                    <Toggle
                      id='autoArchive'
                      checked={autoArchiveEnabled}
                      onChange={(e: any) => {
                        setAutoArchiveEnabled(e.target.checked);
                        if (!e.target.checked) {
                          onChange('autoArchiveDate', null);
                        }
                      }}
                      icons={{
                        checked: <span>Yes</span>,
                        unchecked: <span>No</span>,
                      }}
                    />
                    <hr />
                  </FormGroup>
                )}

                {autoArchiveEnabled && (
                  <FormGroup>
                    <ControlLabel>{__('Archive date')}</ControlLabel>
                    <p>
                      {__('Post will be automatically archived on this date')}
                    </p>
                    <FormControl
                      name='autoArchiveDate'
                      type='datetime-local'
                      defaultValue={formatDate(post.autoArchiveDate)}
                      onChange={(e: any) => {
                        onChange('autoArchiveDate', e.target.value);
                      }}
                    />
                  </FormGroup>
                )}
              </div>
            </li>
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Box>
  );
};

export default TripSection;
