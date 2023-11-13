import React, { useCallback } from 'react';
import styled from 'styled-components';
import Icon from '@erxes/ui/src/components/Icon';
import { colors } from '@erxes/ui/src/styles';
import { BoxRoot, FullContent } from '@erxes/ui/src/styles/main';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import { Link } from 'react-router-dom';

const Box = styled(BoxRoot)`
  width: 320px;
  padding: 40px;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    min-height: 36px;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

type Props = {};

const SelectMenu = props => {
  // const onChangeFunction = useCallback((key, val) => {
  //     props.onChange(key, val);
  //   }, []);

  const renderBox = useCallback((name, icon, desc, path) => {
    // const { name, icon, desc, path } = args;
    return (
      <Box
        selected={true}
        onClick={() => {
          console.log('path', path);
          console.log('props', props);
          props.history.push(path);
        }}
      >
        <Link to={path}>
          <Icon icon={icon} />
          <span>{__(name)}</span>
          <p>{__(desc)}</p>
        </Link>
      </Box>
    );
  }, []);
  const breadcrumb = [
    {
      title: __('Settings'),
      link: '/settings'
    },
    {
      title: __('Business Portal'),
      link: '/settings/business-portal'
    }
  ];
  return (
    <>
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Business Portal')}
            breadcrumb={breadcrumb}
          />
        }
        content={''}
        transparent={true}
      />
      <FullContent center={true}>
        {renderBox(
          'Client portal',
          'user',
          `${__('Helpdesk, knowledge base etc... for your customers')}`,
          `/settings/business-portal/client`
        )}
        {renderBox(
          'Vendor portal',
          'building',
          `${__(
            'Knowledge base, Vendor Company profiles,  etc... for your vendors'
          )}`,
          `/settings/business-portal/vendor`
        )}
      </FullContent>
    </>
  );
};

export default SelectMenu;
