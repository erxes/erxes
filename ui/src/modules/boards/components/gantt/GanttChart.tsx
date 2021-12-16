import React, { useState } from 'react';
import TimeLine from 'react-gantt-timeline';
import {
  GanttContainer,
  NavContainer,
  ModeContainer,
  TimelineContainer,
  AssingStyle,
  TextStyle
} from 'modules/boards/styles/viewtype';
import { withRouter } from 'react-router-dom';
import { IOptions, IItem } from 'modules/boards/types';
import { IRouterProps } from 'modules/common/types';
import { colors } from 'modules/common/styles';
import { ButtonGroup } from 'modules/boards/styles/header';
import { TYPES } from 'modules/boards/constants';
import { capitalize } from 'modules/activityLogs/utils';
import ContextMenu from 'modules/common/components/ContextMenu';
import { EditForm } from 'modules/boards/containers/editForm';
import Assignees from '../Assignees';
import { getColors } from 'modules/boards/utils';

export const stageName = {
  fontWeight: 600
};

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
          backgroundColor: `${colors.bgLight}`,
          fontSize: 12,
          color: `${colors.textPrimary}`
        }
      },
      middle: {
        style: {
          backgroundColor: `${colors.bgActive}`,
          fontSize: 10,
          color: `#486581`
        }
      },
      bottom: {
        style: {
          background: `${colors.bgLight}`,
          fontSize: 10,
          color: `${colors.textPrimary}`
        },
        selectedStyle: {
          background: `${colors.colorCoreBlack}`,
          color: `${colors.colorWhite}`
        }
      }
    },
    taskList: {
      title: {
        label: 'Name',
        style: {
          backgroundColor: `${colors.bgLight}`,
          color: `${colors.textPrimary}`,
          borderBottom: `1px solid ${colors.borderPrimary}`
        }
      },
      task: {
        style: {
          backgroundColor: `${colors.colorWhite}`,
          color: `${colors.colorCoreBlack}`,
          textAlign: 'left',
          borderBottom: `1px solid ${colors.borderPrimary}`
        }
      },
      verticalSeparator: {
        style: {
          backgroundColor: `${colors.bgLight}`
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
          backgroundColor: `${colors.colorWhite}`,
          borderBottom: `1px solid ${colors.borderPrimary}`
        }
      },
      task: {
        showLabel: true,
        style: {
          border: `none`,
          whiteSpace: 'nowrap',
          cursor: 'pointer'
        },
        selectedStyle: {
          borderRadius: 15,
          fontSize: 11,
          border: `1px solid ${colors.colorCoreBlue}`,
          boxShadow: '0px 0px 5px 1px #e6e6e6'
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

  const { items, refetch } = props;
  const groupBy = item => {
    return item.reduce((acc, curr) => {
      if (curr.stage._id) {
        const { _id } = curr.stage;
        const currentItems = acc[_id];

        return {
          ...acc,
          [_id]: currentItems ? [...currentItems, curr] : [curr]
        };
      }
      return acc;
    }, {});
  };

  const grouped = groupBy(items);

  Object.keys(grouped).forEach((key, index) => {
    const _items = grouped[key];
    _items.forEach(item => {
      dbData.push({
        id: item._id,
        start: new Date(item.startDate),
        end: new Date(item.closeDate),
        name: (
          <>
            <AssingStyle>
              <Assignees users={item.assignedUsers} />
            </AssingStyle>
            <TextStyle>
              <span style={stageName}>{item.stage ? item.stage.name : ''}</span>
              &nbsp;-&nbsp;
              {item.name}
            </TextStyle>
          </>
        ),
        color: `${getColors(index)}`
      });

      if (item.relations) {
        dbLinks = dbLinks.concat(item.relations);
      }
    });
  });

  const [data, setData] = useState(dbData);
  const [links, setLinks] = useState(dbLinks);
  const [selectedItem, setSelectedItem] = useState(null as any);
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

  const renderForm = () => {
    if (!selectedItem) {
      return null;
    }

    const { items, options } = props;

    const dbDataRow = items.find(row => row._id === selectedItem.id);

    if (!dbDataRow || !dbDataRow.stage) {
      return null;
    }

    const beforePopupClose = () => {
      props.refetch();

      setSelectedItem(null);
    };

    return (
      <EditForm
        options={options}
        stageId={dbDataRow.stageId}
        itemId={dbDataRow._id}
        beforePopupClose={beforePopupClose}
        hideHeader={true}
        isPopupVisible={true}
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
          refetch={refetch}
          links={links}
          config={config}
          onHorizonChange={onHorizonChange}
          onSelectItem={onSelectItem}
          onUpdateTask={onUpdateTask}
          onCreateLink={onCreateLink}
          mode={timelineMode}
          selectedItem={selectedItem}
          itemheight={45}
          nonEditableName={true}
        />
      </TimelineContainer>
      {renderForm()}
      <ContextMenu elementId="timeline-container" show={Boolean(selectedItem)}>
        <li onClick={deleteItem}>Delete</li>
      </ContextMenu>
    </GanttContainer>
  );
};

export default withRouter(GanttChart);
