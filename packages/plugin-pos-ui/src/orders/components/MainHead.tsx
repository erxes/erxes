import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { __, dimensions, Button, Tip, Icon, ControlLabel } from '@erxes/ui/src';

const MainDescription = styledTS<{
  expand: boolean;
}>(styled.div)`
  width: 100%;
  padding: 30px 10px 30px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  font-size: 12px;
  position: relative;
  cursor: pointer;

  ${(props) => css`
    height: ${props.expand === false && '0px'};
  `}

  h4 {
    margin: 0;
    padding-bottom: 5px;
    font-size: 18px;
    font-weight: 500;
  }
`;

const ActionBar = styledTS<{
  expand: boolean;
}>(styled.div)`
  margin-top: ${(props) => (props.expand ? '-72px' : '')};
  text-align: right;
`;

const Description = styled.div`
  max-width: 90%;
  display: flex;
  align-items: center;
`;

const DescImg = styled.img`
  max-width: 100px;
  max-height: 100px;
  margin-right: ${dimensions.coreSpacing}px;
`;

const Amount = styled.ul`
  display: flex;
  padding-left: 0px;
  overflow-x: auto;
`;

const HeaderContentSmall = styled.div`
  text-align: right;
  min-width: 150px;
  flex-shrink: 0;
  p {
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: bold;
  }
  label {
    margin-right: 0;
  }
  input.form-control {
    box-shadow: none;
    border-radius: 0;
    border: none;
    background: none;
    text-align: right;
    border: none !important;
    padding: 0 !important;
    height: 20px;
    width: 150px;
    &:focus {
      box-shadow: none;
    }
  }
`;

type Props = {
  icon: string;
  title: string;
  summary: any;
  staticKeys: string[];
  actionBar: React.ReactNode;
};

const MainHead = (props: Props) => {
  const { staticKeys, summary, icon, title, actionBar } = props;
  const localExpand = localStorage.getItem('expand');

  const [expand, setExpand] = useState(
    localExpand ? localExpand === 'true' : true,
  );

  const onClick = () => {
    setExpand(!expand);
    localStorage.setItem('expand', expand.toString());
  };

  const onClickSkip = (e) => {
    e.stopPropagation();
  };

  const renderAmount = (summary, key) => {
    if (!Object.keys(summary).includes(key)) {
      return '';
    }

    return (
      <HeaderContentSmall key={key}>
        <ControlLabel>{__(key)}</ControlLabel>
        <p>{summary[key].toLocaleString()}</p>
      </HeaderContentSmall>
    );
  };

  const renderSummary = () => {
    if (!expand) {
      return '';
    }

    if (Object.keys(summary).length === 0) {
      return <></>;
    }

    return (
      <Amount>
        {staticKeys.map((key) => renderAmount(summary, key))}
        {Object.keys(summary)
          .filter((a) => !['_id'].includes(a))
          .filter((a) => !staticKeys.includes(a))
          .map((key) => renderAmount(summary, key))}
      </Amount>
    );
  };

  return (
    <>
      <MainDescription expand={expand} onClick={onClick}>
        <Description>
          {expand && <DescImg src={icon} />}

          <h4>{__(title)}</h4>
          {renderSummary()}
        </Description>
        <Button btnStyle="link" onClick={onClick}>
          <Tip text={__(expand ? 'Shrink' : 'Expand')} placement="top">
            <Icon icon={expand ? 'uparrow' : 'downarrow-2'} />
          </Tip>
        </Button>
        <ActionBar expand={expand} onClick={onClickSkip}>
          {actionBar}
        </ActionBar>
      </MainDescription>
    </>
  );
};

export default MainHead;
