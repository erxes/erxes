import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import { router as routerUtils } from "@erxes/ui/src/utils";
import { Listbox, Transition } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";

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
  list,
  text,
  queryParamName,
  title,
  icon,
}: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const dropDownMenu = () => {
    if (queryParamName === "groupBy") {
      return list.map((m) => (
        <Listbox.Option key={m.title} value={m.title}>
          <a
            href="#listType"
            onClick={() =>
              routerUtils.setParams(navigate, location, {
                [queryParamName]: m.name,
              })
            }
          >
            <Icon icon={m.icon} color="#673FBD" />
            &nbsp;
            {m.title}
          </a>
        </Listbox.Option>
      ));
    }

    return list.map((m) => (
      <Listbox.Option key={m.title} value={m.title}>
        <a
          href="#chartType"
          onClick={() =>
            routerUtils.setParams(navigate, location, {
              [queryParamName]: m.name,
            })
          }
        >
          <Icon icon={m.icon} color="#673FBD" />
          &nbsp;
          {m.title}
        </a>
      </Listbox.Option>
    ));
  };

  const foundTypeName = list.find(
    (t) => t.name === queryParams[queryParamName]
  );

  return (
    <>
      <Icon icon={icon} />
      <span>{title}</span>
      <Listbox>
        <div className="relative">
          <Listbox.Button>
            <Button btnStyle="primary" size="small">
              {foundTypeName
                ? foundTypeName.title.charAt(0).toUpperCase() +
                  foundTypeName.title.slice(1)
                : text}
              <Icon icon="angle-down" />
            </Button>
          </Listbox.Button>
          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="absolute w-full shadow-lg"
          >
            <Listbox.Options static>{dropDownMenu()}</Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </>
  );
};

export default SelectType;
