import { Alert, __, confirm, router } from "coreui/utils";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BarItems } from "@erxes/ui/src/layout/styles";
import Button from "@erxes/ui/src/components/Button";
import CompaniesMerge from "@erxes/ui-contacts/src/companies/components/detail/CompaniesMerge";
import CompanyForm from "@erxes/ui-contacts/src/companies/containers/CompanyForm";
import CompanyRow from "./CompanyRow";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ICompany } from "../../types";
import { IConfigColumn } from "@erxes/ui-forms/src/settings/properties/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import ManageColumns from "@erxes/ui-forms/src/settings/properties/containers/ManageColumns";
import { Menu } from "@headlessui/react";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Pagination from "@erxes/ui/src/components/pagination/Pagination";
import Sidebar from "./Sidebar";
import SortHandler from "@erxes/ui/src/components/SortHandler";
import { TAG_TYPES } from "@erxes/ui-tags/src/constants";
import Table from "@erxes/ui/src/components/table";
import TaggerPopover from "@erxes/ui-tags/src/components/TaggerPopover";
import TemporarySegment from "@erxes/ui-segments/src/components/filter/TemporarySegment";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { gql } from "@apollo/client";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { menuContacts } from "@erxes/ui/src/utils/menus";
import { queries } from "../../graphql";
import withTableWrapper from "@erxes/ui/src/components/table/withTableWrapper";

interface IProps {
  companies: ICompany[];
  columnsConfig: IConfigColumn[];
  loading: boolean;
  searchValue: string;
  totalCount: number;
  // TODO: check is below line not throwing error ?
  toggleBulk: () => void;
  toggleAll: (targets: ICompany[], containerId: string) => void;
  bulk: any[];
  isAllSelected: boolean;
  emptyBulk: () => void;
  removeCompanies: (
    doc: { companyIds: string[] },
    emptyBulk: () => void
  ) => void;
  mergeCompanies: () => void;
  queryParams: any;
  exportCompanies: (bulk: string[]) => void;
  refetch?: () => void;
  renderExpandButton?: any;
  isExpand?: boolean;
  page: number;
  perPage: number;
}

const CompaniesList: React.FC<IProps> = props => {
  const navigate = useNavigate();
  const location = useLocation();
  let timer;

  const [searchValue, setSearchValue] = useState<string | undefined>(
    props.searchValue
  );

  const onChange = () => {
    const { toggleAll, companies } = props;
    toggleAll(companies, "companies");
  };

  const search = e => {
    if (timer) {
      clearTimeout(timer);
    }

    const searchValue = e.target.value;

    setSearchValue(searchValue);
    timer = setTimeout(() => {
      router.removeParams(navigate, location, "page");
      router.setParams(navigate, location, { searchValue });
    }, 500);
  };

  const removeCompanies = companies => {
    const companyIds: string[] = [];

    companies.forEach(company => {
      companyIds.push(company._id);
    });

    props.removeCompanies({ companyIds }, props.emptyBulk);
  };

  const moveCursorAtTheEnd = e => {
    const tmpValue = e.target.value;
    e.target.value = "";
    e.target.value = tmpValue;
  };

  const afterTag = () => {
    props.emptyBulk();

    if (props.refetch) {
      props.refetch();
    }
  };

  const {
    columnsConfig,
    companies,
    loading,
    toggleBulk,
    bulk,
    isAllSelected,
    totalCount,
    mergeCompanies,
    queryParams,
    exportCompanies,
    isExpand,
    renderExpandButton,
    perPage,
    page
  } = props;

  const mainContent = (
    <withTableWrapper.Wrapper>
      <Table
        $whiteSpace="nowrap"
        $bordered={true}
        $hover={true}
        $wideHeader={true}
        $responsive={true}
      >
        <thead>
          <tr>
            <th>
              <FormControl
                checked={isAllSelected}
                componentclass="checkbox"
                onChange={onChange}
              />
            </th>
            {columnsConfig.map(({ name, label, _id }) => (
              <th key={name}>
                {_id !== "#" ? (
                  <SortHandler sortField={name} label={__(label)} />
                ) : (
                  <>#</>
                )}
              </th>
            ))}
            <th>{__("Tags")}</th>
          </tr>
        </thead>
        <tbody id="companies" className={isExpand ? "expand" : ""}>
          {companies.map((company, i) => (
            <CompanyRow
              index={(page - 1) * perPage + i + 1}
              company={company}
              columnsConfig={columnsConfig}
              isChecked={bulk.includes(company)}
              key={company._id}
              navigate={navigate}
              toggleBulk={toggleBulk}
            />
          ))}
        </tbody>
      </Table>
    </withTableWrapper.Wrapper>
  );

  const addTrigger = (
    <Button btnStyle="success" size="small" icon="plus-circle">
      Add company
    </Button>
  );

  const editColumns = <a href="#edit">{__("Choose Properties/View")}</a>;

  const mergeButton = (
    <Button btnStyle="primary" size="small" icon="merge">
      Merge
    </Button>
  );

  let actionBarLeft: React.ReactNode;

  const companiesMerge = props => {
    return <CompaniesMerge {...props} objects={bulk} save={mergeCompanies} />;
  };

  if (bulk.length > 0) {
    const tagButton = (
      <Button btnStyle="simple" size="small" icon="tag-alt">
        Tag
      </Button>
    );

    const onClick = () =>
      confirm()
        .then(() => {
          removeCompanies(bulk);
        })
        .catch(error => {
          Alert.error(error.message);
        });

    const refetchQuery = {
      query: gql(queries.companyCounts),
      variables: { only: "byTag" }
    };

    actionBarLeft = (
      <BarItems>
        <TaggerPopover
          type={TAG_TYPES.COMPANY}
          successCallback={afterTag}
          targets={bulk}
          trigger={tagButton}
          refetchQueries={[refetchQuery]}
        />

        {bulk.length === 2 && (
          <ModalTrigger
            title={__("Merge Companies")}
            size="xl"
            dialogClassName="modal-1000w"
            trigger={mergeButton}
            content={companiesMerge}
          />
        )}

        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={onClick}
        >
          Remove
        </Button>
      </BarItems>
    );
  }

  const manageColumns = props => {
    return (
      <ManageColumns
        {...props}
        location={location}
        navigate={navigate}
        contentType="core:company"
      />
    );
  };

  const companyForm = props => {
    return <CompanyForm {...props} queryParams={queryParams} />;
  };

  const actionBarRight = (
    <BarItems>
      <FormControl
        type="text"
        placeholder={__("Type to search")}
        onChange={search}
        value={searchValue}
        autoFocus={true}
        onFocus={moveCursorAtTheEnd}
      />

      {renderExpandButton()}

      <TemporarySegment contentType={`core:company`} />

      <Menu as="div" className="relative">
        <Menu.Button>
          <Button btnStyle="simple" size="small">
            {__("Customize ")} <Icon icon="angle-down" />
          </Button>
        </Menu.Button>
        <Menu.Items className="absolute" unmount={false}>
          <Menu.Item>
            <ModalTrigger
              title="Manage Columns"
              trigger={editColumns}
              content={manageColumns}
            />
          </Menu.Item>
          <Menu.Item>
            <Link to="/settings/properties?type=core:company">
              {__("Manage properties")}
            </Link>
          </Menu.Item>
          <Menu.Item>
            <a href="#export" onClick={exportCompanies.bind(this, bulk)}>
              {__("Export this companies")}
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <Link to="/settings/importHistories?type=core:company">
        <Button btnStyle="primary" size="small" icon="arrow-from-right">
          {__("Go to import")}
        </Button>
      </Link>
      <ModalTrigger
        title="New company"
        trigger={addTrigger}
        autoOpenKey="showCompanyModal"
        size="lg"
        content={companyForm}
        backDrop="static"
      />
    </BarItems>
  );

  const actionBar = (
    <Wrapper.ActionBar right={actionBarRight} left={actionBarLeft} />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__(`Companies`) + ` (${totalCount})`}
          queryParams={queryParams}
          submenu={menuContacts}
        />
      }
      actionBar={actionBar}
      footer={<Pagination count={totalCount} />}
      leftSidebar={<Sidebar loadingMainQuery={loading} />}
      content={
        <DataWithLoader
          data={mainContent}
          loading={loading}
          count={companies.length}
          emptyText="Add in your first company!"
          emptyImage="/images/actions/1.svg"
        />
      }
      hasBorder={true}
    />
  );
};

export default withTableWrapper("Company", CompaniesList);
