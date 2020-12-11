import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import React from 'react';

type Props = {
  page: any;
};

declare function editSchedule(editToken: string, inDarkMode: boolean): any;

class PageRow extends React.Component<Props> {
  onEdit = pageEditToken => {
    editSchedule(pageEditToken, false);
  };

  onView = e => {
    e.preventDefault();
    window.open(`https://schedule.nylas.com/${this.props.page.slug}`);
  };

  renderExtraLinks() {
    const { page } = this.props;

    return (
      <>
        <Tip text="Edit" placement="top">
          <Button
            btnStyle="link"
            onClick={this.onEdit.bind(this, page.edit_token)}
            icon="edit-3"
          />
        </Tip>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={this.onView} icon="eye" />
        </Tip>
      </>
    );
  }

  render() {
    const { page } = this.props;

    return (
      <tr key={page.id}>
        <td>{page.name}</td>
        <td>
          <ActionButtons>{this.renderExtraLinks()}</ActionButtons>
        </td>
      </tr>
    );
  }
}

export default PageRow;
