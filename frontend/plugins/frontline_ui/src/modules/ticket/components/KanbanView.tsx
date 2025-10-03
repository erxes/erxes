import { faker } from '@faker-js/faker';
import type { DragEndEvent } from './Kanban';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from './Kanban';
import { useState } from 'react';
import { Button } from 'erxes-ui';
import { IconDots, IconPlus } from '@tabler/icons-react';
import { KanbanViewCard } from '@/ticket/components/KanbanCard';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns = [
  { id: faker.string.uuid(), name: 'Backlog', color: '#6B7280' },
  { id: faker.string.uuid(), name: 'Planned', color: '#6B7280' },
  { id: faker.string.uuid(), name: 'In Progress', color: '#F59E0B' },
  { id: faker.string.uuid(), name: 'Done', color: '#10B981' },
  { id: faker.string.uuid(), name: 'In Review', color: '#F59E0B' },
  { id: faker.string.uuid(), name: 'Cancelled', color: '#EF4444' },
];
const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));
const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: capitalize(faker.company.buzzPhrase()),
    number: `${faker.number
      .int(99999)
      .toString()
      .padStart(5, '0')}_${faker.number.int(9999).toString().padStart(4, '0')}`,
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    column: faker.helpers.arrayElement(columns).id,
    owner: faker.helpers.arrayElement(users),
    tags: Array.from({ length: faker.number.int(4) })
      .fill(null)
      .map(() => ({
        id: faker.string.uuid(),
        name: faker.word.noun(),
      })),
  }));

export const KanbanView = () => {
  const [features, setFeatures] = useState(exampleFeatures);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const status = columns.find(({ id }) => id === over.id);
    if (!status) {
      return;
    }
    setFeatures(
      features.map((feature) => {
        if (feature.id === active.id) {
          return { ...feature, column: status.id };
        }
        return feature;
      }),
    );
  };
  return (
    <KanbanProvider columns={columns} data={features} onDragEnd={handleDragEnd}>
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>
            {column.name}{' '}
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <IconDots />
              </Button>
              <Button variant="ghost" size="icon">
                <IconPlus />
              </Button>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(feature) => (
              <KanbanCard
                column={column.name}
                id={feature.id}
                key={feature.id}
                name={feature.name}
              >
                <KanbanViewCard feature={feature} />
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};
