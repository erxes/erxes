export function genID() {
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

export const config = {
  header: {
    top: {
      style: {
        backgroundColor: '#f7f9fa',
        fontSize: 12,
        color: '#393C40'
      }
    },
    middle: {
      style: {
        backgroundColor: 'lightgrey',
        fontSize: 9,
        color: '#393C40'
      }
    },
    bottom: {
      style: {
        background: 'white',
        fontSize: 9,
        color: '#393C40'
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
      label: 'Name',
      style: {
        backgroundColor: '#f7f9fa',
        color: '#393C40'
      }
    },
    task: {
      style: {
        backgroundColor: 'white',
        color: '#393C40'
      },
      verticalSeparator: {
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
          backgroundColor: '#fff'
        }
      },
      task: {
        showLabel: true,
        style: {
          borderRadius: 3,
          boxShadow: '2px 2px 8px #888888'
        }
      }
    }
  }
};
