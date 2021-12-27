import Icon from 'modules/common/components/Icon';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { router as routerUtils } from 'modules/common/utils';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';

type Props = {
  queryParams: any;
  list: any;
  text: string;
  queryParamName: string;
  title: string;
  icon: string;
};

const SelectType = ({
  queryParams,
  history,
  list,
  text,
  queryParamName,
  title,
  icon
}: Props & IRouterProps) => {
  const dropDownMenu = () => {
    if (queryParamName === 'groupBy') {
      return (
        <Dropdown.Menu>
          {list.map(m => (
            <li key={m.title}>
              <a
                href="#listType"
                onClick={() =>
                  routerUtils.setParams(history, { [queryParamName]: m.name })
                }
              >
                <Icon icon={m.icon} color="#673FBD" />
                &nbsp;
                {m.title}
              </a>
            </li>
          ))}
        </Dropdown.Menu>
      );
    }

    return (
      <Dropdown.Menu>
        {list.map(m => (
          <li key={m.title}>
            <a
              href="#chartType"
              onClick={() =>
                routerUtils.setParams(history, { [queryParamName]: m.name })
              }
            >
              <Icon icon={m.icon} color="#673FBD" />
              &nbsp;
              {m.title}
            </a>
          </li>
        ))}
      </Dropdown.Menu>
    );
  };

  const foundTypeName = list.find(t => t.name === queryParams[queryParamName]);

  return (
    <>
      <Icon icon={icon} />
      <span>{title}</span>
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-groupby">
          <Button btnStyle="primary" size="small">
            {foundTypeName
              ? foundTypeName.title.charAt(0).toUpperCase() +
                foundTypeName.title.slice(1)
              : text}
            <Icon icon="angle-down" />
          </Button>
        </Dropdown.Toggle>
        {dropDownMenu()}
      </Dropdown>
    </>
  );
};

export default withRouter(SelectType);
