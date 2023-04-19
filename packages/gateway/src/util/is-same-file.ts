import * as fs from 'fs';

const isSameFile = (path1: string, path2: string): boolean => {
  const file1 = fs.readFileSync(path1);
  const file2 = fs.readFileSync(path2);
  return file1.equals(file2);
};

export default isSameFile;
