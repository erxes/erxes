import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __
} from '@erxes/ui/src';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import {
  CommonCalculateFields,
  SelectRiskIndicator
} from '../../../common/utils';
import { FormContainer, ListItem, Padding, RemoveRow } from '../../../styles';

type Props = {
  handleChange: (doc: any) => void;
  indicatorGroups?: any[];
  generalConfig?: any;
};

type State = {
  indicatorGroups: any[];
  generalConfig: any;
};

export default class GroupingIndicators extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      indicatorGroups: props.indicatorGroups || [],
      generalConfig: props.generalConfig || {}
    };
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>
  ): void {
    if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
      this.props.handleChange({
        ...this.state.generalConfig,
        groups: this.state.indicatorGroups
      });
    }
  }

  renderItem(
    { _id, indicatorIds, calculateLogics, calculateMethod, percentWeight },
    length,
    ignoreIds
  ) {
    const { indicatorGroups, generalConfig } = this.state;

    const handleSelect = (values, id) => {
      this.setState({
        indicatorGroups: indicatorGroups.map(indicator =>
          indicator._id === id
            ? { ...indicator, indicatorIds: values }
            : indicator
        )
      });
    };

    const removeItem = () => {
      this.setState({
        indicatorGroups: indicatorGroups.filter(
          indicator => indicator._id !== _id
        )
      });
    };

    const onChangeCalculateField = values => {
      const updatedIndicatorGroups = indicatorGroups.map(indicator =>
        indicator._id === _id ? { ...indicator, ...values } : indicator
      );

      this.setState({
        indicatorGroups: updatedIndicatorGroups
      });
    };

    const handleChangePercentWeight = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      this.setState({
        indicatorGroups: indicatorGroups.map(indicator =>
          indicator._id === _id
            ? { ...indicator, percentWeight: Number(value) }
            : indicator
        )
      });
    };
    return (
      <ListItem key={_id}>
        {length > 1 && (
          <RemoveRow onClick={removeItem}>
            <Icon icon="times-circle" />
          </RemoveRow>
        )}
        <Padding vertical horizontal>
          <FormContainer column gap>
            <FormContainer row gap>
              <div style={{ flex: 1 }}>
                <FormGroup>
                  <ControlLabel>{__('Indicators')}</ControlLabel>
                  <SelectRiskIndicator
                    name="indicatorIds"
                    label="Choose Indicators"
                    initialValue={indicatorIds}
                    onSelect={values => handleSelect(values, _id)}
                    multi={true}
                  />
                </FormGroup>
              </div>
              {length > 1 && (
                <FormGroup>
                  <ControlLabel>{__('Percent Weigth')}</ControlLabel>
                  <FormControl
                    type="number"
                    name="percentWeight"
                    placeholder="Type Percent Weigth"
                    value={percentWeight}
                    onChange={handleChangePercentWeight}
                  />
                </FormGroup>
              )}
            </FormContainer>
            <CommonCalculateFields
              onChange={onChangeCalculateField}
              calculateLogics={calculateLogics}
              calculateMethod={calculateMethod}
            />
          </FormContainer>
        </Padding>
      </ListItem>
    );
  }

  renderGeneralGroupConfig() {
    const handleChange = values => {
      this.setState({ generalConfig: values });
    };

    return (
      <CollapseContent title="General Group Config">
        <CommonCalculateFields
          onChange={handleChange}
          {...this.state.generalConfig}
        />
      </CollapseContent>
    );
  }

  render() {
    const { indicatorGroups } = this.state;

    const addGroup = () => {
      this.setState({
        indicatorGroups: [
          ...indicatorGroups,
          { _id: Math.random().toString(), indicatorIds: [] }
        ]
      });
    };

    const ignoreIds: string[] = [];

    for (const group of indicatorGroups) {
      ignoreIds.push(...(group?.indicatorIds || []));
    }

    return (
      <>
        {indicatorGroups.length > 1 && (
          <Padding vertical>{this.renderGeneralGroupConfig()}</Padding>
        )}
        <CollapseContent title="Groups">
          {indicatorGroups.map(group =>
            this.renderItem(group, indicatorGroups.length, ignoreIds)
          )}
          <LinkButton onClick={addGroup}>
            <Icon icon="plus-1" /> {__('Add group')}
          </LinkButton>
        </CollapseContent>
      </>
    );
  }
}
