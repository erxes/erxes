import React, { useState } from 'react';
import TimeLine from 'react-gantt-timeline';
import {
  GanttContainer,
  NavContainer,
  ModeContainer,
  TimelineContainer
} from 'modules/boards/styles/viewtype';
import { withRouter } from 'react-router-dom';
import { IOptions, IItem } from 'modules/boards/types';
import { IRouterProps } from 'modules/common/types';
import { colors } from 'modules/common/styles';
import { ButtonGroup } from 'modules/boards/styles/header';
import { TYPES } from 'modules/boards/constants';
import { capitalize } from 'modules/activityLogs/utils';
import EditForm from 'modules/boards/containers/editForm/EditForm';
import useContextMenu from './useContextMenu';
import './style.css';

type Props = {
  items: IItem[];
  options: IOptions;
  refetch: () => void;
  save: (items: any[], links: any[]) => void;
  stageId?: string;
} & IRouterProps;

const GanttChart = (props: Props) => {
  const config = {
    header: {
      top: {
        style: {
          backgroundColor: `${colors.bgActive}`,
          fontSize: 12,
          color: `${colors.colorCoreBlack}`
        }
      },
      middle: {
        style: {
          backgroundColor: `${colors.bgLight}`,
          fontSize: 9,
          color: `${colors.colorCoreBlack}`
        }
      },
      bottom: {
        style: {
          background: `${colors.bgUnread}`,
          fontSize: 9,
          color: `${colors.colorCoreBlack}`
        },
        selectedStyle: {
          background: `${colors.colorCoreBlack}`,
          fontWeight: 'bold',
          color: `${colors.colorWhite}`
        }
      }
    },
    taskList: {
      title: {
        label: 'Name',
        style: {
          backgroundColor: `${colors.bgActive}`,
          color: `${colors.colorCoreBlack}`
        }
      },
      task: {
        style: {
          backgroundColor: `${colors.colorWhite}`,
          color: `${colors.colorCoreBlack}`,
          textAlign: 'left',
          paddingLeft: 20
        }
      },
      verticalSeparator: {
        style: {
          backgroundColor: `${colors.bgActive}`
        },
        grip: {
          style: {
            backgroundColor: `${colors.colorCoreRed}`
          }
        }
      }
    },
    dataViewPort: {
      rows: {
        style: {
          cursorPointer: true,
          backgroundColor: `${colors.colorWhite}`
        }
      },
      task: {
        showLabel: true,
        style: {
          paddingTop: 5,
          borderRadius: 5,
          border: '1px solid #6569DF',
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        },
        selectedStyle: {
          borderRadius: 5,
          fontSize: 11,
          selectedColor: `${colors.colorWhite}`,
          boxShadow: '0px 0px 7px 1px #6569DF',
          border: '1px solid #6569DF'
        }
      }
    },
    links: {
      color: `${colors.colorCoreOrange}`,
      selectedColor: `${colors.colorCoreRed}`
    }
  };

  const dbData: any[] = [];
  let dbLinks: any[] = [];

  props.items.forEach(item => {
    dbData.push({
      id: item._id,
      start: new Date(item.startDate),
      end: new Date(item.closeDate),
      name: `${item.name} (${item.stage ? item.stage.name : ''})`,
      color: '#6569DF'
    });

    if (item.relations) {
      dbLinks = dbLinks.concat(item.relations);
    }
  });

  const [data, setData] = useState(dbData);
  const [links, setLinks] = useState(dbLinks);
  const [selectedItem, setSelectedItem] = useState(null as any);
  const [timelineMode, setTimelineMode] = useState('month');

  const Menu = ({ onDelete }) => {
    const { anchorPoint, show } = useContextMenu();

    if (show) {
      return (
        <ul
          className="menu"
          style={{ top: anchorPoint.y, left: anchorPoint.x }}
        >
          <li onClick={onDelete}>Delete</li>
        </ul>
      );
    }
    return <></>;
  };

  const onHorizonChange = (start, end) => {
    const result = dbData.filter(item => {
      return (
        (item.start < start && item.end > end) ||
        (item.start > start && item.start < end) ||
        (item.end > start && item.end < end)
      );
    });

    setData(result);
  };

  const onSelectItem = item => {
    setSelectedItem(item);
  };

  const renderForm = () => {
    if (!selectedItem) {
      return null;
    }

    const { items, options } = props;

    const dbData = items.find(row => row._id === selectedItem.id);

    if (!dbData || !dbData.stage) {
      return null;
    }

    return (
      <EditForm
        stageId={dbData.stage._id}
        itemId={dbData._id}
        hideHeader={true}
        isPopupVisible={true}
        options={options}
      />
    );
  };

  const save = () => {
    const items: any[] = [];

    for (const item of data) {
      items.push({
        _id: item.id,
        startDate: item.start,
        closeDate: item.end
      });
    }

    props.save(items, links);
  };

  const onUpdateTask = (item, prop) => {
    if (
      item.start.getTime() !== prop.start.getTime() ||
      item.end.getTime() !== prop.end.getTime()
    ) {
      item.start = prop.start;
      item.end = prop.end;

      setData([...data]);

      save();
    }
  };

  const createLink = (start, end) => {
    return {
      id: Math.random().toString(),
      start: start.task.id,
      startPosition: start.position,
      end: end.task.id,
      endPosition: end.position
    };
  };

  const onCreateLink = item => {
    const newLink = createLink(item.start, item.end);

    setLinks([...links, newLink]);

    save();
  };

  const modeChange = value => {
    setTimelineMode(value);
  };

  const deleteItem = () => {
    if (selectedItem) {
      const index = links.indexOf(selectedItem);

      if (index > -1) {
        links.splice(index, 1);

        setLinks([...links]);

        save();
      }
    }
  };

  return (
    <GanttContainer>
      <NavContainer>
        <ModeContainer>
          <ButtonGroup>
            {TYPES.all.map(item => {
              const onClick = () => modeChange(item);

              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={onClick}
                  className={timelineMode === item ? 'active' : ''}
                >
                  {capitalize(item)}
                </a>
              );
            })}
          </ButtonGroup>
        </ModeContainer>
      </NavContainer>
      <TimelineContainer>
        <TimeLine
          data={data}
          links={links}
          config={config}
          onHorizonChange={onHorizonChange}
          onSelectItem={onSelectItem}
          onUpdateTask={onUpdateTask}
          onCreateLink={onCreateLink}
          mode={timelineMode}
          selectedItem={selectedItem}
          itemheight={40}
          nonEditableName={true}
        />
      </TimelineContainer>
      <Menu onDelete={deleteItem} />
      {renderForm()}
    </GanttContainer>
  );
};

export default withRouter(GanttChart);
