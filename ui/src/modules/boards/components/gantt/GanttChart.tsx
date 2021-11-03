import React, { Component } from 'react';
import TimeLine from 'react-gantt-timeline';
import Generator from './Generator.js';
import {
  GanttContainer,
  NavContainer,
  ModeTitle,
  OperationButtonContainer,
  ModeContainer,
  TimelineContainer
} from 'modules/boards/styles/viewtype';

const config = {
  header: {
    month: {
      dateFormat: 'MMMM  YYYY',
      style: {
        background: 'linear-gradient( grey, black)',
        textShadow: '0.5px 0.5px black',
        fontSize: 12
      }
    },
    dayOfWeek: {
      style: {
        background: 'linear-gradient( orange, grey)',
        fontSize: 9
      }
    },
    dayTime: {
      style: {
        background: 'linear-gradient( grey, black)',
        fontSize: 9,
        color: 'orange'
      },
      selectedStyle: {
        background: 'linear-gradient( #d011dd ,#d011dd)',
        fontWeight: 'bold',
        color: 'white'
      }
    }
  },
  taskList: {
    title: {
      label: 'Task Todo',
      style: {
        background: 'linear-gradient( grey, black)'
      }
    },
    task: {
      style: {
        backgroundColor: 'grey',
        color: 'white'
      }
    },
    verticalSeparator: {
      style: {
        backgroundColor: '#fbf9f9'
      },
      grip: {
        style: {
          backgroundColor: 'red'
        }
      }
    }
  },
  dataViewPort: {
    rows: {
      style: {
        backgroundColor: 'white',
        borderBottom: 'solid 0.5px silver'
      }
    },
    task: {
      showLabel: true,
      style: {
        borderRadius: 1,
        boxShadow: '2px 2px 8px #888888'
      }
    }
  }
};

class GanttChart extends Component<any, any> {
  private data;

  constructor(props) {
    super(props);
    let result = Generator.generateData();
    console.log(result);
    this.data = result.data;
    this.state = {
      itemheight: 20,
      data: [],
      selectedItem: null,
      timelineMode: 'month',
      links: result.links,
      nonEditableName: false
    };
  }

  handleDayWidth = e => {
    this.setState({ daysWidth: parseInt(e.target.value) });
  };

  handleItemHeight = e => {
    this.setState({ itemheight: parseInt(e.target.value) });
  };

  onHorizonChange = (start, end) => {
    let result = this.data.filter(item => {
      return (
        (item.start < start && item.end > end) ||
        (item.start > start && item.start < end) ||
        (item.end > start && item.end < end)
      );
    });
    this.setState({ data: result });
  };

  onSelectItem = item => {
    this.setState({ selectedItem: item });
  };

  onUpdateTask = (item, props) => {
    item.start = props.start;
    item.end = props.end;
    this.setState({ data: [...this.state.data] });
  };

  onCreateLink = item => {
    let newLink = Generator.createLink(item.start, item.end);
    this.setState({ links: [...this.state.links, newLink] });
  };

  getbuttonStyle(value) {
    return this.state.timelineMode == value
      ? { backgroundColor: 'grey', boder: 'solid 1px #223344' }
      : {};
  }

  modeChange = value => {
    this.setState({ timelineMode: value });
  };

  genID() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-4' +
      S4().substr(0, 3) +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    ).toLowerCase();
  }

  getRandomDate() {
    let result = new Date();
    result.setDate(result.getDate() + Math.random() * 10);
    return result;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  addTask = () => {
    let newTask = {
      id: this.state.data.length + 1,
      start: new Date(),
      end: this.getRandomDate(),
      name: 'New Task',
      color: this.getRandomColor()
    };
    this.setState({ data: [newTask, ...this.state.data] });
  };

  delete = () => {
    if (this.state.selectedItem) {
      let index = this.state.links.indexOf(this.state.selectedItem);
      if (index > -1) {
        this.state.links.splice(index, 1);
        this.setState({ links: [...this.state.links] });
      }
      index = this.state.data.indexOf(this.state.selectedItem);
      if (index > -1) {
        this.state.data.splice(index, 1);
        this.setState({ data: [...this.state.data] });
      }
    }
  };

  render() {
    return (
      <GanttContainer>
        <NavContainer>
          <ModeTitle>Full Demo</ModeTitle>
          <OperationButtonContainer>
            <div className="mode-button" onClick={this.addTask}>
              <svg height={30} width={30} viewBox="0 0 48 48">
                <path
                  fill="silver"
                  d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 22h-8v8h-4v-8h-8v-4h8v-8h4v8h8v4z"
                />
              </svg>
            </div>
            <div className="mode-button" onClick={this.delete}>
              <svg height={30} width={30} viewBox="0 0 48 48">
                <path
                  fill="silver"
                  d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm10 22H14v-4h20v4z"
                />
              </svg>
            </div>
          </OperationButtonContainer>
          <ModeContainer>
            <div
              className="mode-container-item mode-container-item-left"
              onClick={e => this.modeChange('day')}
              style={this.getbuttonStyle('day')}
            >
              Day
            </div>
            <div
              className="mode-container-item"
              onClick={e => this.modeChange('week')}
              style={this.getbuttonStyle('week')}
            >
              Week
            </div>
            <div
              className="mode-container-item"
              onClick={e => this.modeChange('month')}
              style={this.getbuttonStyle('month')}
            >
              Month
            </div>
            <div
              className="mode-container-item mode-container-item-right"
              onClick={e => this.modeChange('year')}
              style={this.getbuttonStyle('year')}
            >
              Year
            </div>
            <div
              className="mode-container-item mode-container-item-editable-toggle"
              style={{ marginLeft: '20px' }}
              onClick={() => {
                this.setState({
                  nonEditableName: !this.state.nonEditableName
                });
              }}
            >
              {this.state.nonEditableName ? 'Enable' : 'Disable'} name edition
            </div>
          </ModeContainer>
        </NavContainer>
        <TimelineContainer>
          <TimeLine
            config={config}
            data={this.state.data}
            links={this.state.links}
            onHorizonChange={this.onHorizonChange}
            onSelectItem={this.onSelectItem}
            onUpdateTask={this.onUpdateTask}
            onCreateLink={this.onCreateLink}
            mode={this.state.timelineMode}
            itemheight={this.state.itemheight}
            selectedItem={this.state.selectedItem}
            nonEditableName={this.state.nonEditableName}
          />
        </TimelineContainer>
      </GanttContainer>
    );
  }
}

export default GanttChart;
