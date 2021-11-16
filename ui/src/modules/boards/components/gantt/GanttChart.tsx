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
import { genID, config } from './utils';

type Props = {
  length: number;
  items: IItem[];
  options: IOptions;
  refetch: () => void;
  groupType: string;
  save: (items: any[], links: any[]) => void;
} & IRouterProps;

const GanttChart = (props: Props) => {
  const dbData: Array<any> = [];
  let dbLinks: Array<any> = [];

  props.items.forEach(item => {
    if (item.startDate && item.closeDate) {
      dbData.push({
        id: item._id,
        start: new Date(item.startDate),
        end: new Date(item.closeDate),
        name: item.name,
        color: '#5629B6'
      });

      if (item.relations) {
        dbLinks = dbLinks.concat(item.relations);
      }
    }
  });

  const [data, setData] = useState(dbData);
  const [links, setLinks] = useState(dbLinks);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timelineMode, setTimelineMode] = useState('month');

  const onHorizonChange = (start, end) => {
    const result = data.filter(item => {
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

  const onUpdateTask = (item, props) => {
    item.start = props.start;
    item.end = props.end;

    setData([...data]);
  };

  const createLink = (start, end) => {
    return {
      id: genID(),
      start: start.task.id,
      startPosition: start.position,
      end: end.task.id,
      endPosition: end.position
    };
  };

  const onCreateLink = item => {
    let newLink = createLink(item.start, item.end);

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
    const items: Array<any> = [];

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
          <Button btnStyle="danger" onClick={deleteItem}>
            {__('Delete')}
          </Button>
          <Button btnStyle="success" onClick={save}>
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
          itemheight={35}
          selectedItem={selectedItem}
          nonEditableName={true}
        />
      </TimelineContainer>
    </GanttContainer>
  );
};

export default withRouter(GanttChart);
