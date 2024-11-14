import React from 'react';
import { useState } from 'react';
import {
  __,
  Button,
  ButtonMutate,
  ControlLabel,
  FormGroup,
  Icon,
  Tabs,
  TabTitle,
  Toggle
} from '@erxes/ui/src';
import dayjs from 'dayjs';
import moment from 'moment';
import Datetime from '@nateradebaugh/react-datetime';
import { Features, Row, ToggleSection } from '../styles';
import { ModalFooter } from 'modules/common/styles/main';
import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { gql } from '@apollo/client';
import { IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const mutationTypes = {
  branch: {
    mutation: mutations.branchesEdit,
    refetchQuery: queries.branchesMain
  },
  department: {
    mutation: mutations.departmentsEdit,
    refetchQuery: queries.departmentsMain
  }
};

type RowProps = {
  from: string;
  to: string;
  onChage: (
    key: string,
    value: string | Date | undefined,
    activeWorkhour: any
  ) => void;
  activeWorkhour: any;
  keys: [string, string];
  titles: [string, string];
};

const TimeRow = ({
  from,
  to,
  onChage,
  activeWorkhour,
  keys,
  titles
}: RowProps) => {
  const [fromKey, toKey] = keys;
  const [startTitle, endTitle] = titles;

  const convertor = (date: string) =>
    new Date(moment(date, 'HH:mm').toISOString());

  return (
    <Row>
      <FormGroup>
        <ControlLabel>{__(startTitle)}</ControlLabel>
        <Datetime
          timeFormat={'HH:mm'}
          dateFormat={false}
          value={convertor(from)}
          onChange={value => onChage(fromKey, value, activeWorkhour)}
        />
      </FormGroup>
      <Icon icon="exchange-alt" />
      <FormGroup>
        <ControlLabel>{__(endTitle)}</ControlLabel>
        <Datetime
          timeFormat={'HH:mm'}
          dateFormat={false}
          value={convertor(to)}
          onChange={value => onChage(toKey, value, activeWorkhour)}
        />
      </FormGroup>
    </Row>
  );
};

type Props = {
  item: any;
  closeModal: () => void;
  type: keyof typeof mutationTypes;
};

function removeTypename(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

export default function WorkhourForm({ item, closeModal, type }: Props) {
  const [workhours, setWorkhours] = useState<any>(item?.workhours || {});
  const [activeWorkhourKey, setActiveWorkhourKey] = useState('Monday');

  const onChange = (key, value) => {
    setWorkhours({ ...workhours, [key]: value });
  };

  const onChangeTime = (key, value, activeWorkhour) => {
    if (value) {
      onChange(activeWorkhourKey, {
        ...activeWorkhour,
        [key]: dayjs(value).format('HH:mm')
      });
    }
  };

  const generateDoc = doc => {
    return removeTypename(doc);
  };

  const activeWorkhour = workhours[activeWorkhourKey];
  const { startFrom, endTo, lunchStartFrom, lunchEndTo } = activeWorkhour || {};

  const renderForm = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <Tabs full={true}>
          {[
            ...WEEK_DAYS,
            ...Object.keys(workhours || {}).filter(
              key => !WEEK_DAYS.includes(key)
            )
          ].map(key => (
            <TabTitle
              key={key}
              className={key === activeWorkhourKey ? 'active' : ''}
              onClick={() => {
                setActiveWorkhourKey(key);
              }}
            >
              {__(key)}
            </TabTitle>
          ))}
        </Tabs>
        {!!activeWorkhourKey && (
          <>
            <FormGroup>
              <ToggleSection>
                <ControlLabel>{__('Inactive')}</ControlLabel>
                <Toggle
                  defaultChecked={false}
                  checked={activeWorkhour?.inactive}
                  onChange={() =>
                    onChange(activeWorkhourKey, {
                      ...activeWorkhour,
                      inactive: !activeWorkhour?.inactive
                    })
                  }
                />
              </ToggleSection>
            </FormGroup>
            <Features isToggled={!activeWorkhour?.inactive}>
              <Row>
                <TimeRow
                  from={startFrom}
                  to={endTo}
                  onChage={onChangeTime}
                  activeWorkhour={activeWorkhour}
                  keys={['startFrom', 'endTo']}
                  titles={['Start time', 'End time']}
                />
                <TimeRow
                  from={lunchStartFrom}
                  to={lunchEndTo}
                  onChage={onChangeTime}
                  activeWorkhour={activeWorkhour}
                  keys={['lunchStartFrom', 'lunchEndTo']}
                  titles={['Lunch Start time', 'Lunch End time']}
                />
              </Row>
            </Features>
          </>
        )}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          <ButtonMutate
            mutation={mutationTypes[type].mutation}
            refetchQueries={[
              {
                query: gql(mutationTypes[type].refetchQuery)
              }
            ]}
            variables={generateDoc({ ...item, workhours })}
            isSubmitted={isSubmitted}
            type="submit"
            successMessage={`You successfully setup workhours`}
          />
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderForm} />;
}
