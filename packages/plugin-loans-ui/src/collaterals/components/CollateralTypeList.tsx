import Icon from "@erxes/ui/src/components/Icon";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Tip from "@erxes/ui/src/components/Tip";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";

import { __, router } from "@erxes/ui/src/utils";
import React, { useMemo } from "react";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";

import { useLocation, useNavigate } from "react-router-dom";
import { ICollateralTypeDocument } from "../types";
import CollateralTypeForm from "../containers/CollateralTypeForm";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import Button from "@erxes/ui/src/components/Button";

const { Section } = Wrapper.Sidebar;

interface IProps {
  queryParams: any;
  list: ICollateralTypeDocument[];
  totalCount?: number;
  loading: boolean;
  remove: (id: string) => void;
}

const renderFormTrigger = (
  trigger: React.ReactNode,
  collateralType?: ICollateralTypeDocument
) => {
  const content = (props) => (
    <CollateralTypeForm {...props} data={collateralType} />
  );

  return (
    <ModalTrigger
      title="Collateral Type"
      trigger={trigger}
      size="lg"
      content={content}
    />
  );
};

const List = (props: IProps) => {
  const { queryParams, list, totalCount, loading, remove } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const clearCategoryFilter = () => {
    router.setParams(navigate, location, { categoryId: null });
  };

  const renderEditAction = (category: ICollateralTypeDocument) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return renderFormTrigger(trigger, category);
  };

  const renderRemoveAction = (category: ICollateralTypeDocument) => {
    return (
      <Button btnStyle="link" onClick={() => remove(category._id)}>
        <Tip text={__("Remove")} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  };

  const onClick = (id: string) => {
    router.removeParams(navigate, location, "page");
    router.setParams(navigate, location, { categoryId: id });
  };

  const renderCollateralTypeList = useMemo(() => {
    return (
      <CollapsibleList
        items={list}
        editAction={renderEditAction}
        removeAction={renderRemoveAction}
        loading={loading}
        onClick={onClick}
        queryParams={queryParams}
        treeView={
          !["disabled", "archived"].includes(
            router.getParam(location, ["status"])
          )
        }
        keyCount="productCount"
      />
    );
  }, [list, loading, totalCount]);

  const renderCategoryHeader = () => {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle" block={true}>
        {__("Add collateral type")}
      </Button>
    );
    return (
      <Section.Title>
        {renderFormTrigger(trigger)}
        <Section.QuickButtons>
          {router.getParam(location, "categoryId") && (
            <a href="#cancel" tabIndex={0} onClick={clearCategoryFilter}>
              <Tip text={__("Clear filter")} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
    );
  };

  return (
    <Sidebar>
      <Section
        maxHeight={188}
        $collapsible={totalCount ? totalCount > 9 : false}
      >
        {renderCategoryHeader()}
        {renderCollateralTypeList}
      </Section>
    </Sidebar>
  );
};

export default List;
