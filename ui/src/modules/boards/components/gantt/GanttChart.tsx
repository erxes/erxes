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
import ContextMenu from 'modules/common/components/ContextMenu';

type Props = {
  items: IItem[];
  options: IOptions;
  refetch: () => void;
  save: (items: any[], links: any[]) => void;
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
          border: '2px solid #4205C4',
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        },
        selectedStyle: {
          borderRadius: 5,
          fontSize: 11,
          selectedColor: `${colors.colorWhite}`,
          boxShadow: '0px 0px 7px 1px #673FBD',
          border: '1px solid #5629B6'
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
      color: '#5629B6'
    });

    if (item.relations) {
      dbLinks = dbLinks.concat(item.relations);
    }
  });

  const [data, setData] = useState(dbData);
  const [links, setLinks] = useState(dbLinks);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timelineMode, setTimelineMode] = useState('month');

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

        setSelectedItem(null);

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
      <TimelineContainer id="timeline-container">
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
      <ContextMenu elementId="timeline-container" show={Boolean(selectedItem)}>
        <li onClick={deleteItem}>Delete</li>
      </ContextMenu>
    </GanttContainer>
  );
};

export default withRouter(GanttChart);
