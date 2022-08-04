import React, { useCallback, useEffect, useState } from 'react';
import TimeLine from 'react-gantt-timeline';
import {
  GanttContainer,
  TimelineContainer,
  AssingStyle,
  TextStyle
} from 'modules/boards/styles/view';
import { withRouter } from 'react-router-dom';
import { IOptions, IItem } from 'modules/boards/types';
import { IRouterProps } from 'modules/common/types';
import { colors } from 'modules/common/styles';
import ContextMenu from 'modules/common/components/ContextMenu';
import { EditForm } from 'modules/boards/containers/editForm';
import { callback, generateName } from 'modules/boards/components/gantt/utils';
import Assignees from 'modules/boards/components/Assignees';
import { getColors } from 'modules/boards/utils';
import {
  BoardItemArgs,
  GanttLink
} from 'modules/boards/containers/gantt/GanttChart';

type GanttData = {
  id: string;
  start: Date;
  end: Date;
  name: any;
  color?: string;
};

type Props = {
  items: IItem[];
  options: IOptions;
  refetch: () => void;
  save: (items: BoardItemArgs[], links: GanttLink[]) => void;
  groups: any;
  groupType: string;
};

type FinalProps = Props &
  IRouterProps & { data: GanttData[]; links: GanttLink[] };

const GanttChart = (props: FinalProps) => {
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
          border: `none`,
          boxShadow: '0px 0px 5px 1px #e6e6e6'
        }
      }
    },
    links: {
      color: `${colors.colorCoreOrange}`,
      selectedColor: `${colors.colorCoreRed}`
    }
  };

  const { items, refetch, options, save } = props;

  const [data, setData] = useState(props.data);
  const [links, setLinks] = useState(props.links);
  const [selectedItem, setSelectedItem] = useState(null as any);

  const saveCallback = useCallback(() => {
    const pushItems: BoardItemArgs[] = [];

    for (const item of data) {
      pushItems.push({
        _id: item.id,
        startDate: item.start,
        closeDate: item.end
      });
    }

    save(pushItems, links);
  }, [links, data, save]);

  useEffect(() => {
    setData(props.data);
    setLinks(props.links);
  }, [props.data, props.links]);

  useEffect(() => {
    saveCallback();
  }, [links, data, props.links, props.data, saveCallback]);

  const onSelectItem = item => {
    setSelectedItem(item);
  };

  const onUpdateTask = (item, prop) => {
    if (
      item.start.getTime() !== prop.start.getTime() ||
      item.end.getTime() !== prop.end.getTime()
    ) {
      item.start = prop.start;
      item.end = prop.end;

      setData([...data]);
    }
  };

  const createLink = (start, end) => {
    return {
      id: Math.random().toString(),
      start: start.task.id,
      end: end.task.id
    };
  };

  const onCreateLink = item => {
    const newLink = createLink(item.start, item.end);

    setLinks(links.concat(newLink));
  };

  const deleteItem = () => {
    if (selectedItem) {
      const index = links.indexOf(selectedItem);

      if (index > -1) {
        links.splice(index, 1);

        setLinks([...links]);

        setSelectedItem(null);
      }
    }
  };

  const renderForm = () => {
    if (!selectedItem) {
      return null;
    }

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

  return (
    <GanttContainer>
      <TimelineContainer id="timeline-container">
        <TimeLine
          data={data}
          refetch={refetch}
          links={links}
          config={config}
          onSelectItem={onSelectItem}
          onUpdateTask={onUpdateTask}
          onCreateLink={onCreateLink}
          mode={'month'}
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

const WithRouterGanttChart = withRouter(GanttChart);

const GenerateData = (props: Props) => {
  const dbData: GanttData[] = [];
  const dbLinks: GanttLink[] = [];
  const { groups, groupType, items } = props;

  groups.forEach((groupObj, index) => {
    const filtered = items.filter(item => callback(groupType)(item, groupObj));

    if (filtered.length > 0) {
      dbData.push({
        id: groupObj._id,
        start: new Date('1970-01-01'),
        end: new Date('1970-01-01'),
        name: (
          <TextStyle>
            <span style={{ fontWeight: 600 }}>{generateName(groupObj)}</span>
          </TextStyle>
        )
      });
    }

    filtered.forEach(item => {
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
              <div style={{ paddingLeft: 20 }}>{item.name}</div>
            </TextStyle>
          </>
        ),
        color: `${groupObj.colorCode || getColors(index)}`
      });

      if (item.relations) {
        dbLinks.push(...item.relations);
      }
    });
  });

  const extendedProps = {
    ...props,
    data: dbData,
    links: dbLinks
  };

  return <WithRouterGanttChart {...extendedProps} />;
};

export default GenerateData;
