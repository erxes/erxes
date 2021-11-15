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
    }
  }
};
