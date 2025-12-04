import React from "react";
import { Link } from "react-router-dom";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils/core";
import { Title } from "@erxes/ui-settings/src/styles";
import Button from "@erxes/ui/src/components/Button";
import DataWithLoader from "@erxes/ui/src/components/DataWithLoader";
import EmptyContent from "@erxes/ui/src/components/empty/EmptyContent";
import { EMPTY_SEGMENT_CONTENT } from "@erxes/ui-settings/src/constants";
import Table from "@erxes/ui/src/components/table";
import { IAutoNumbering } from "../container/autoNumberingList";
import WithPermission from '@erxes/ui/src/components/WithPermission';

type Props = {
  loading: boolean;
  modules: IAutoNumbering[];
  removeAutoNumbering: (id: string) => void;
};

class AutoNumberingList extends React.Component<Props> {
  renderContent() {
    const { modules, removeAutoNumbering } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__("Module")}</th>
            <th>{__("Pattern")}</th>
            <th>{__("Fractional Part")}</th>
            <th>{__("Last Number")}</th>
            <th>{__("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m, i) => (
            <tr key={i}>
              <td>{m.module}</td>
              <td>{m.pattern}</td>
              <td>{m.fractionalPart}</td>
              <td>
                {/* Edit Button */}
                <Link to={`/settings/auto-numbering/edit/${m._id}`}>
                  <WithPermission action="manageAutoNumberings">
                    <Button
                      btnStyle="link"
                      size="small"
                      icon="edit"
                    >
                      {__('Edit')}
                    </Button>
                  </WithPermission>
                </Link>

                {/* Delete Button */}
                <WithPermission action="manageAutoNumberings">
                  <Button
                    btnStyle="danger"
                    size="small"
                    onClick={() => removeAutoNumbering(m._id)}
                    icon="trash-alt"
                  >
                    {__('Delete')}
                  </Button>
                </WithPermission>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const { loading, modules } = this.props;

    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Auto Numbering") },
    ];

    const title = <Title $capitalize>{__("Auto Numbering")}</Title>;

    const actionBarRight = (
      <WithPermission action="manageAutoNumberings">
        <Link to="/settings/auto-numbering/new">
          <Button btnStyle="success" icon="plus-circle">
            {__("Add New")}
          </Button>
        </Link>
      </WithPermission>
    );

    const actionBar = (
      <Wrapper.ActionBar left={title} right={actionBarRight} wideSpacing />
    );

    return (
      <Wrapper
        header={<Wrapper.Header title={__("Auto Numbering")} breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={modules.length}
            emptyContent={
              <EmptyContent
                content={EMPTY_SEGMENT_CONTENT}
                maxItemWidth="330px"
              />
            }
          />
        }
      />
    );
  }
}

export default AutoNumberingList;