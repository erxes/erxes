import { Attributes } from '@erxes/ui-automations/src//components/forms/actions/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Tip,
  __,
  dimensions
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { removeParams, setParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { Placement } from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';
import { generateParamsIds } from '../../common/utils';
import { ClearableBtn, FormContainer } from '../../styles';
import { CARD_FILTER_ATTRIBUTES } from './constants';

type Props = {
  title?: string;
  withoutPopoverTitle?: boolean;
  icon?: string;
  iconColor?: string;
  customComponent?: JSX.Element;
  placement?: Placement;
  rootClose?: boolean;
};

const PopoverContent = styled.div`
  padding: ${dimensions.coreSpacing}px;
  line-height: 24px;

  h5 {
    margin-top: 0;
    line-height: 20px;
  }

  ol {
    padding-left: 20px;
  }
`;

export class DetailPopOver extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderOverlay() {
    const { title, withoutPopoverTitle } = this.props;
    return (
      <Popover id="help-popover" style={{ zIndex: 1050 }}>
        <PopoverContent>
          {!withoutPopoverTitle && title && <h5>{title}</h5>}
          {this.props.children}
        </PopoverContent>
      </Popover>
    );
  }

  renderContent() {
    const { customComponent, title, icon, iconColor } = this.props;
    if (customComponent) {
      return customComponent;
    }

    return (
      <>
        {title && (
          <div>
            <ControlLabel>{__(title)}</ControlLabel>
          </div>
        )}
        <div>
          <Button
            style={{ padding: '7px 0' }}
            btnStyle="link"
            iconColor={iconColor}
            icon={icon ? icon : 'question-circle'}
          ></Button>
        </div>
      </>
    );
  }

  render() {
    const { rootClose = true } = this.props;

    return (
      <OverlayTrigger
        trigger={'click'}
        placement={this.props.placement || 'auto'}
        overlay={this.renderOverlay()}
        rootClose={rootClose}
      >
        <FormContainer row flex gapBetween={5} align="center">
          {this.renderContent()}
        </FormContainer>
      </OverlayTrigger>
    );
  }
}

type CardFilterTypes = {
  type: string;
  onChange: (value: string, name: string) => void;
  queryParams: any;
  history: any;
};

export class CardFilter extends React.Component<
  CardFilterTypes,
  { selectedAttribution: any }
> {
  constructor(props) {
    super(props);

    this.state = {
      selectedAttribution: null
    };
  }

  componentDidMount(): void {
    const { queryParams } = this.props;

    if (
      Object.keys(queryParams || {}).find(key =>
        ['cardBranchIds', 'cardDepartmentIds', 'cardName'].includes(key)
      )
    ) {
      const selectedAttribution = CARD_FILTER_ATTRIBUTES.find(attr =>
        Object.keys(queryParams).includes(attr.name)
      );
      this.setState({ selectedAttribution });
    }
  }

  renderField() {
    const { queryParams, history } = this.props;
    const {
      selectedAttribution: { name, label }
    } = this.state;

    const handleChange = (value, name) => {
      this.props.onChange(value, name);
    };

    if (name === 'cardBranchIds') {
      return (
        <SelectBranches
          label={label}
          name={name}
          onSelect={handleChange}
          initialValue={queryParams?.cardBranchIds}
        />
      );
    }

    if (name === 'cardDepartmentIds') {
      return (
        <SelectDepartments
          label={label}
          name={name}
          onSelect={handleChange}
          initialValue={queryParams?.cardDepartmentIds}
        />
      );
    }

    return (
      <FormControl
        placeholder={`Choose ${label}`}
        name={name}
        defaultValue={queryParams?.cardName || ''}
        onChange={({ currentTarget }) => {
          const { value } = currentTarget as HTMLInputElement;

          setTimeout(() => {
            removeParams(history, 'page');
            setParams(history, { cardName: value });
          }, 500);
        }}
      />
    );
  }

  render() {
    const { type, onChange, queryParams, history } = this.props;

    if (!type) {
      return null;
    }

    const { selectedAttribution } = this.state;

    const handleSelectAttributiom = item => {
      selectedAttribution && onChange('', selectedAttribution?.name);

      this.setState({ selectedAttribution: item });
    };

    const handleClear = () => {
      this.setState({ selectedAttribution: null });
      removeParams(history, 'cardBranchIds', 'cardDepartmentIds', 'cardName');
    };

    return (
      <FormGroup>
        <FormContainer row spaceBetween>
          <DetailPopOver
            title="Attribution"
            withoutPopoverTitle
            icon="downarrow-2"
            placement="top"
          >
            <Attributes>
              {CARD_FILTER_ATTRIBUTES.map(item => (
                <li
                  key={item.name}
                  onClick={handleSelectAttributiom.bind(this, item)}
                >
                  {__(item.label)}
                  {selectedAttribution?.name === item.name && (
                    <Icon icon="check" style={{ paddingLeft: 5 }} />
                  )}
                </li>
              ))}
            </Attributes>
          </DetailPopOver>
          {selectedAttribution &&
            Object.keys(queryParams || {}).find(key =>
              ['cardBranchIds', 'cardDepartmentIds', 'cardName'].includes(key)
            ) && (
              <ClearableBtn onClick={handleClear}>
                <Tip text="Clear" placement="top">
                  <Icon icon="cancel-1" />
                </Tip>
              </ClearableBtn>
            )}
        </FormContainer>
        {selectedAttribution && (
          <FormGroup>
            <ControlLabel>{selectedAttribution?.label}</ControlLabel>
            {this.renderField()}
          </FormGroup>
        )}
      </FormGroup>
    );
  }
}

export const generateCardFiltersQueryParams = queryParams => {
  const params: any = {};

  if (queryParams?.cardBranchIds) {
    params.name = 'branchIds';
    params.values = generateParamsIds(queryParams.cardBranchIds);
  }

  if (queryParams?.cardDepartmentIds) {
    params.name = 'departmentIds';
    params.values = generateParamsIds(queryParams.cardDepartmentIds);
  }
  if (queryParams?.cardName) {
    params.name = 'name';
    params.value = queryParams.cardName;
    params.regex = true;
  }

  return params;
};
