import ObjectHelper from './ObjectHelper';

class Generator {
  constructor() {}
  generateData() {
    let data = [];
    let links = [];
    let now = new Date();
    let nowId = this.addRecord(now, 0, data);

    let test = new Date();
    test.setDate(test.getDate() + 3);
    test.setHours(0, 0, 0, 0);
    let tomorrowId = this.addRecord(test, 1, data);
    // this.addLink(nowId,tomorrowId,links)

    for (let i = 1; i < 1000; i++) {
      this.addRecord(
        this.randomDate(new Date(2016, 9, 1), new Date(2020, 9, 1)),
        i,
        data
      );
    }
    let start = 0;
    let end = 0;
    for (let i = 1; i < 100; i++) {
      start = Math.trunc(Math.random() * 1000);
      end = Math.trunc(Math.random() * 1000);

      this.addLink(data[start].id, data[end].id, links);
    }

    return { data: data, links: links };
  }

  addRecord(starDate, i, result) {
    let endDate = new Date(starDate.getTime());
    endDate.setDate(starDate.getDate() + Math.random() * 20);
    let id = ObjectHelper.genID();
    let record = {
      id: id,
      name: `Task ${i}`,
      start: starDate,
      end: endDate,
      color: this.getRandomColor()
    };
    result.push(record);
    return id;
  }

  addLink(startId, endId, list) {
    let id = ObjectHelper.genID();
    let record = {
      id: id,
      start: startId,
      startPosition: 1,
      end: endId,
      endPosition: 0
    };
    list.push(record);
    return id;
  }

  createLink(start, end) {
    return {
      id: ObjectHelper.genID(),
      start: start.task.id,
      startPosition: start.position,
      end: end.task.id,
      endPosition: end.position
    };
  }

  randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  // setRandomColor() {
  //   $('#colorpad').css('background-color', getRandomColor());
  // }
}

const instance = new Generator();
export default instance;
