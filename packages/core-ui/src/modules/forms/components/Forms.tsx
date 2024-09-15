import { Icon } from '@erxes/ui/src/components';
import { colors } from '@erxes/ui/src/styles';
import { BoxRoot, FullContent } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

const Box = styled(BoxRoot)`
  width: 320px;
  height: 220px;
  padding: 40px;
  background: ${colors.bgLight};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  min-height: 200px;

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
    margin-top: 10px;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    flex-grow: 1;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

type Props = {
  formTypes: any[];
};

const Forms = (props: Props) => {
  const navigate = useNavigate();

  const renderBox = (name, icon, desc, kind) => {
    return (
      <Box
        onClick={() => {
          // navigate to /forms/${}
          navigate(`/forms/${kind}`);
        }}
      >
        <Icon icon={icon} />
        <span>{__(name)}</span>
        <p>{__(desc)}</p>
      </Box>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Forms')}
          breadcrumb={[{ title: __('Forms') }]}
        />
      }
      content={
        <FullContent $center={true}>
          {props.formTypes.map((formType) => {
            return renderBox(
              formType.title,
              formType.icon,
              formType.description,
              formType.contentType
            );
          })}
        </FullContent>
      }
      hasBorder={true}
      transparent={true}
    />
  );
};

export default Forms;
