import {
  Button,
  ButtonMutate,
  Chooser,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Spinner,
  Toggle,
  __
} from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations as riskIndicatorMutattions } from '../../../indicator/graphql';
import { queries } from '../graphql';
import RiskIndicatorForm from '../../../indicator/containers/Form';
import RiskGroupsForm from '../../../indicator/groups/containers/Form';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { useState, useEffect, useRef } from 'react';
import { DetailPopOver } from '../../../assessments/common/utils';
import { FormContainer } from '../../../styles';
import { queries as groupsQueries } from '../../../indicator/groups/graphql';

type Props = {
  detail: any;
  refetchQueries: ({ id }: { id: string }) => any;
  closeModal: () => void;
  handleSelect: ({
    indicatorId,
    groupId
  }: {
    indicatorId?: string;
    groupId?: string;
  }) => void;

  filters: {
    branchIds: string[];
    departmentIds: string[];
    operationIds: string[];
  };
};

export default function SelectIndicators(props: Props) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [perPage, setPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [useGroups, setUseGroups] = useState(false);

  const { data, error, loading } = useQuery(
    gql(useGroups ? groupsQueries.list : queries.riskIndicators),
    {
      variables: { searchValue, perPage, ...props.filters }
    }
  );
  useEffect(() => {
    if (props.detail) {
      fethcDetail();
    }
  }, [searchValue, data]);

  if (error) {
    return <EmptyState text="Something went wrong" />;
  }

  if (loading) {
    return <Spinner />;
  }

  const list = data[useGroups ? 'riskIndicatorsGroups' : 'riskIndicators'];

  const renderAddForm = props => {
    if (useGroups) {
      return <RiskGroupsForm {...props} />;
    }

    const generateDoc = values => {
      return { ...values };
    };

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={riskIndicatorMutattions.riskIndicatorAdd}
          variables={values}
          callback={callback}
          refetchQueries={props.refetchQueries}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully added risk assessment`}
        />
      );
    };

    return (
      <RiskIndicatorForm
        {...props}
        renderButton={renderButton}
        generateDoc={generateDoc}
      />
    );
  };

  const renderFilters = () => {
    const toggleGrouping = () => {
      setUseGroups(useGroups => !useGroups);
      setSelectedItems([]);
    };

    return (
      <DetailPopOver title="Filters" icon="downarrow-2">
        <FormGroup>
          <ControlLabel>{__('Use groups of indicators')}</ControlLabel>
          <Toggle onChange={toggleGrouping} checked={useGroups} />
        </FormGroup>
      </DetailPopOver>
    );
  };
  const search = (value: string, reload?: boolean) => {
    if (!reload) {
      setPerPage(10);
    }
    setPerPage(perPage + 5);
    setSearchValue(value);
  };

  const { closeModal, handleSelect } = props;

  const onSelect = value => {
    const selectedItemIds = value.map(item => item._id);
    setSelectedItems(selectedItemIds);

    const fieldName = useGroups ? 'groupId' : 'indicatorId';

    handleSelect({ [fieldName]: selectedItemIds[0] });
  };
  function fethcDetail() {
    const { detail } = props;
    if (detail.groupId) {
      setUseGroups(true);

      setSelectedItems(
        (list || []).filter(item => detail.groupId === item._id)
      );
    }
    if (detail.indicatorId && !useGroups) {
      setSelectedItems(
        (list || []).filter(item => detail.indicatorId === item._id)
      );
    }
  }

  const updateProps = {
    title: `${useGroups ? 'Indicators Groups' : `Indicators`}`,
    datas: list || [],
    data: { name: 'Risk Assessment', datas: selectedItems },
    search: search,
    clearState: () => search('', true),
    renderName: indicator => indicator.name,
    renderForm: renderAddForm,
    onSelect,
    closeModal: () => closeModal(),
    perPage: perPage,
    renderFilter: renderFilters,
    limit: 1
  };
  return <Chooser {...updateProps} />;
}
