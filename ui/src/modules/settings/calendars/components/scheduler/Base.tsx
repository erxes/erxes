import Button from 'modules/common/components/Button';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  pages: any[];
  accessToken: string;
  refetchQueries: () => void;
};

declare function editSchedule(editToken: string, inDarkMode: boolean): any;
declare function manageSchedulingPage(
  accessToken: string,
  inDarkMode: boolean
): any;

class Base extends React.Component<Props> {
  onEdit = pageEditToken => {
    editSchedule(pageEditToken, false);

    this.props.refetchQueries();
  };

  managePages = () => {
    manageSchedulingPage(this.props.accessToken, false);

    this.props.refetchQueries();
  };

  render() {
    const { pages } = this.props;

    return (
      <div>
        <Button onClick={this.managePages} btnStyle="success">
          Manage scheduling pages
        </Button>
        <br />
        <br />
        <br />

        <table>
          <thead>
            <tr>
              <th>Your Scheduling Pages</th>
              <th> Action</th>
            </tr>
          </thead>

          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td>
                  {page.name}
                  <br />
                  <Link
                    to={`https://schedule.nylas.com/${page.slug}`}
                    target="_blank"
                  >
                    https://schedule.nylas.com/{page.slug}
                  </Link>
                </td>
                <td>
                  <Button
                    onClick={this.onEdit.bind(this, page.edit_token)}
                    size="small"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Base;
