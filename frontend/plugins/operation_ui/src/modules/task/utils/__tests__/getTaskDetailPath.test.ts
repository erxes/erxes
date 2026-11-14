import { getTaskDetailPath } from '../getTaskDetailPath';

describe('getTaskDetailPath', () => {
  it.each([
    ['/operation/tasks', '/operation/tasks/t1'],
    ['/operation/tasks/created', '/operation/tasks/t1'],
    ['/contacts/customers', '/operation/tasks/t1'],
    ['/operation/projects', '/operation/tasks/t1'],
    ['/operation/team/a/tasks', '/operation/team/a/tasks/t1'],
    ['/operation/team/a/projects', '/operation/team/a/tasks/t1'],
    ['/operation/team/a/cycles/c', '/operation/team/a/tasks/t1'],
    ['/operation/projects/p/tasks', '/operation/projects/p/tasks/t1'],
    [
      '/operation/team/a/projects/p/overview',
      '/operation/team/a/projects/p/tasks/t1',
    ],
  ])('from %s opens %s', (pathname, expected) => {
    expect(getTaskDetailPath('t1', pathname)).toBe(expected);
  });
});
