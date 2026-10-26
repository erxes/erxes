import type { IContactWidgetProps } from 'ui-modules';
import { ProjectsContactSection } from './ProjectsContactSection';
import { TasksContactSection } from './TasksContactSection';

// Operation's sections on a customer or company overview
// (`widgets.contactWidgets`).
export const ContactWidgets = ({ module, ...props }: IContactWidgetProps) => {
  if (module === 'tasks') {
    return <TasksContactSection {...props} />;
  }

  if (module === 'projects') {
    return <ProjectsContactSection {...props} />;
  }

  return null;
};

export default ContactWidgets;
