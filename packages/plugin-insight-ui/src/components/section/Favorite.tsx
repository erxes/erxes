import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@erxes/ui/src/components/Box";
import Button from "@erxes/ui/src/components/Button";
import { CSSTransition } from "react-transition-group";
import CollapsibleList from "@erxes/ui/src/components/collapsibleList/CollapsibleList";
import ReportForm from "../../containers/report/Form";
import DashboardForm from "../../containers/dashboard/Form";
import Icon from "@erxes/ui/src/components/Icon";
import { RightDrawerContainer } from "../../styles";
import { SidebarList } from "@erxes/ui/src/layout/styles";
import Spinner from "@erxes/ui/src/components/Spinner";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils/index";
import { colors } from "@erxes/ui/src/styles";

type Props = {
    queryParams: any

    list: any
    loading: boolean

    update: (id: string, type: string) => void
    remove: (id: string, type: string) => void
}

const Favorite = (props: Props) => {

    const { queryParams, list, loading, update, remove } = props

    const navigate = useNavigate();

    const wrapperRef = useRef<any>(null);

    const [showDrawer, setShowDrawer] = useState<any>(false);
    const [currentItem, setCurrentItem] = useState<any>({} as any);

    const closeDrawer = () => {
        setShowDrawer(false);
    };

    if (loading || !list?.length) {
        return null
    }

    const handleClick = (_id) => {

        const { type } = (list || []).find((item) => item._id === _id)

        navigate(`/insight?${type}Id=${_id}`, { replace: true });
    };

    const renderEditAction = (item: any) => {
        return (
            <Button
                btnStyle="link"
                onClick={() => {
                    setCurrentItem(item);
                    setShowDrawer(!showDrawer);
                }}
            >
                <Tip text={__("Edit")} placement="bottom">
                    <Icon icon="edit" />
                </Tip>
            </Button>
        );
    };

    const renderRemoveAction = (item: any) => {

        const { _id, type } = item

        return (
            <Button btnStyle="link" onClick={() => remove(_id, type)}>
                <Tip text={__("Remove")} placement="bottom">
                    <Icon icon="times-circle" />
                </Tip>
            </Button>
        );
    };

    const renderAdditionalActions = (item: any) => {

        const { _id, type, isFavorite } = item

        const favoriteIcon = (
            <i style={{ display: "flex" }}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? colors.colorPrimary : 'none'}
                    stroke={isFavorite ? colors.colorPrimary : colors.colorCoreGray}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </i>
        )

        const favoriteAction = (
            <Button btnStyle="link" onClick={() => update(_id, type)} >
                <Tip text={__("Favorite")} placement="bottom">
                    {favoriteIcon}
                </Tip>
            </Button>
        )

        return (
            <>
                {favoriteAction}
            </>
        );
    };

    const renderForm = () => {
        const { type, _id } = currentItem;

        const formComponents = {
            dashboard: DashboardForm,
            report: ReportForm,
        };

        const FormComponent = formComponents[type];

        if (!FormComponent) return null;

        const formProps = {
            queryParams,
            [`${type}Id`]: _id,
            closeDrawer,
        };

        return <FormComponent {...formProps} />;
    };

    const renderContent = () => {
        if (loading) {
            return <Spinner objective={true} height='50px' />;
        }

        return (
            <SidebarList>
                <CollapsibleList
                    items={list}
                    queryParams={queryParams}
                    keyCount="chartsCount"
                    icon="chart-pie"
                    treeView={false}
                    onClick={handleClick}
                    editAction={renderEditAction}
                    removeAction={renderRemoveAction}
                    additionalActions={renderAdditionalActions}
                />
            </SidebarList>
        );
    };

    return (
        <>

            <Box
                title="Favorite"
                name="favorite"
                isOpen={
                    Object.keys(queryParams).length === 0
                        ? true
                        : !!queryParams.dashboardId
                }
                collapsible={false}
            >
                {renderContent()}
            </Box>

            <div ref={wrapperRef}>
                <CSSTransition
                    in={showDrawer}
                    timeout={300}
                    classNames="slide-in-right"
                    unmountOnExit={true}
                >
                    <RightDrawerContainer>
                        {renderForm()}
                    </RightDrawerContainer>
                </CSSTransition>
            </div>
        </>
    )
}

export default Favorite