import path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

export const readFile = async (filename: string) => {
  const filePath = path.resolve(
    __dirname,
    `../../private/emailTemplates/${filename}.html`,
  );
  return fs.promises.readFile(filePath, 'utf8');
};

/**
 * Apply template
 */
export const applyTemplate = async (data: any, templateName: string) => {
  let template: any = await readFile(templateName);

  template = Handlebars.compile(template.toString());

  return template(data);
};
