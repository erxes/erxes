import { IProjectDocument } from '../../../@types/project';

export const defaultProjectFieldFormatter = (value: any) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join('; ');
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
};

export const cleanDescription = (description: any) => {
  if (!description) return '';
  if (typeof description === 'string' && (description.startsWith('[') || description.startsWith('{'))) {
    try {
      const parsed = JSON.parse(description);
      const isArray = Array.isArray(parsed);
      const isObject = typeof parsed === 'object' && parsed !== null;
      if (isArray || isObject) {
        const blocks = isArray ? parsed : [parsed];
        const extractText = (content: any[]): string => {
          if (!Array.isArray(content)) return '';
          return content
            .map((item) => {
              if (item.type === 'link') {
                return extractText(item.content || []);
              }
              return item.text || '';
            })
            .join('');
        };

        const processBlock = (block: any): string => {
          let text = '';
          if (block.content) {
            text += extractText(block.content);
          }
          if (block.children && Array.isArray(block.children)) {
            const childrenText = block.children.map(processBlock).filter(Boolean).join('\n');
            if (childrenText) {
              text += '\n' + childrenText;
            }
          }
          return text;
        };

        return blocks.map(processBlock).filter(Boolean).join('\n');
      }
    } catch {
      // ignore
    }
  }
  return String(description);
};

const getDeepValue = (obj: any, path: string) => {
  if (!path.includes('.')) return obj?.[path];
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const buildProjectExportRow = (
  project: IProjectDocument,
  selectedFields?: string[],
  maps?: {
    statusMap?: Map<string, string>;
    teamMap?: Map<string, string>;
    leadMap?: Map<string, string>;
    membersMap?: Map<string, string>;
    creatorMap?: Map<string, string>;
    tagMap?: Map<string, string>;
  },
  formatter = defaultProjectFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || defaultProjectFieldFormatter;

  const {
    statusMap,
    teamMap,
    leadMap,
    membersMap,
    creatorMap,
    tagMap,
  } = maps || {};

  const formatTeams = (teamIds?: any[]) => {
    if (!teamIds || !teamIds.length) return '';
    return teamIds.map(id => teamMap?.get(String(id)) || String(id)).join(', ');
  };

  const formatMembers = (memberIds?: any[]) => {
    if (!memberIds || !memberIds.length) return '';
    return memberIds.map(id => membersMap?.get(String(id)) || String(id)).join(', ');
  };

  const formatTags = (tagIds?: any[]) => {
    if (!tagIds || !tagIds.length) return '';
    return tagIds.map(id => tagMap?.get(String(id)) || String(id)).join(', ');
  };

  const allFields: Record<string, any> = {
    _id: formatValue(project._id),
    name: formatValue(project.name),
    description: formatValue(cleanDescription(project.description)),
    status: formatValue(statusMap?.get(String(project.status)) || project.status),
    priority: formatValue(project.priority),
    teams: formatValue(formatTeams(project.teamIds)),
    tags: formatValue(formatTags(project.tagIds)),
    startDate: formatValue(project.startDate ? new Date(project.startDate) : ''),
    targetDate: formatValue(project.targetDate ? new Date(project.targetDate) : ''),
    lead: formatValue(leadMap?.get(String(project.leadId)) || project.leadId),
    members: formatValue(formatMembers(project.memberIds)),
    createdBy: formatValue(creatorMap?.get(String(project.createdBy)) || project.createdBy),
    createdAt: formatValue(project.createdAt ? new Date(project.createdAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(project._id || '') };

    for (const key of selectedFields) {
      if (key === 'description') {
        result[key] = formatValue(cleanDescription(project.description));
      } else if (key === 'status') {
        result[key] = formatValue(statusMap?.get(String(project.status)) || project.status);
      } else if (key === 'teams') {
        result[key] = formatValue(formatTeams(project.teamIds));
      } else if (key === 'tags') {
        result[key] = formatValue(formatTags(project.tagIds));
      } else if (key === 'lead') {
        result[key] = formatValue(leadMap?.get(String(project.leadId)) || project.leadId);
      } else if (key === 'members') {
        result[key] = formatValue(formatMembers(project.memberIds));
      } else if (key === 'createdBy') {
        result[key] = formatValue(creatorMap?.get(String(project.createdBy)) || project.createdBy);
      } else {
        result[key] = formatValue(getDeepValue(project, key));
      }
    }

    return result;
  }

  return allFields;
};
