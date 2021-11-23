import React, { useState } from 'react';
import TimeLine from 'react-gantt-timeline';
import {
  GanttContainer,
  NavContainer,
  ModeContainer,
  TimelineContainer
} from 'modules/boards/styles/viewtype';
import { withRouter } from 'react-router-dom';
import Button from 'modules/common/components/Button';
import { IOptions, IItem } from 'modules/boards/types';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { colors } from 'modules/common/styles';

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

  const onUpdateTask = (item, prop) => {
    item.start = prop.start;
    item.end = prop.end;

    setData([...data]);
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
      }
    }
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

  return (
    <GanttContainer>
      <NavContainer>
        <ModeContainer>
          <Button
            btnStyle="simple"
            size="small"
            onClick={e => modeChange('day')}
          >
            {__('Day')}
          </Button>
          <Button
            btnStyle="simple"
            size="small"
            onClick={e => modeChange('week')}
          >
            {__('Week')}
          </Button>
          <Button
            btnStyle="simple"
            size="small"
            onClick={e => modeChange('month')}
          >
            {__('Month')}
          </Button>
          <Button
            btnStyle="simple"
            size="small"
            onClick={e => modeChange('year')}
          >
            {__('Year')}
          </Button>
          <Button btnStyle="danger" size="small" onClick={deleteItem}>
            {__('Delete')}
          </Button>
          <Button btnStyle="success" size="small" onClick={save}>
            {__('Save')}
          </Button>
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
          itemheight={40}
          selectedItem={selectedItem}
          nonEditableName={true}
        />
      </TimelineContainer>
    </GanttContainer>
  );
};

export default withRouter(GanttChart);
