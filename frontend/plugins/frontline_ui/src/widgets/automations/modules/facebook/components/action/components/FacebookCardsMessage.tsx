import { IconPhotoScan, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Card, Form, Input, Label, Tabs, Textarea } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import { TBotMessageCard } from '../states/replyMessageActionForm';
import { FacebookMessageProps } from '../types/messageActionForm';
import { FacebookMessageButtonsGenerator } from './FacebookMessageButtonsGenerator';
import { InputTextCounter } from './InputTextCounter';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

export const FacebookCardsMessage = ({
  message,
  index,
}: FacebookMessageProps) => {
  const { control } = useReplyMessageAction();
  const { cards = [] } = message || {};

  const addPage = (onChange: (...event: any[]) => void) => {
    onChange([
      ...cards,
      {
        _id: generateAutomationElementId(),
        label: `Page ${(cards?.length || 0) + 1}`,
      },
    ]);
  };

  const onChangeCardInfo = (
    id: string,
    newData: any,
    onChange: (...event: any[]) => void,
  ) => {
    onChange(
      cards.map((card: TBotMessageCard) =>
        card._id === id ? { ...card, ...newData } : card,
      ),
    );
  };

  const onRemoveCard = (
    cardIndex: number,
    onChange: (...event: any[]) => void,
  ) => {
    onChange(cards.filter((_, index) => index !== cardIndex));
  };

  return (
    <Form.Field
      control={control}
      name={`messages.${index}.cards`}
      render={({ field }) => (
        <Form.Item className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label>Templates</Label>
            <div className="flex items-center gap-2">
              <InputTextCounter count={cards.length} limit={10} />
              <Button
                variant="outline"
                className="float-end"
                disabled={cards.length >= 10}
                onClick={() => addPage(field.onChange)}
              >
                <IconX className="size-3" /> add page
              </Button>
            </div>
          </div>
          <Tabs>
            <div className="overflow-x-auto p-2">
              <Tabs.List defaultValue={cards?.length === 1 ? '1' : undefined}>
                {cards.map((_, index) => (
                  <Tabs.Trigger key={index} value={String(index)}>{`${
                    index + 1
                  } Page`}</Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>
            {cards.map((card, index) => (
              <Tabs.Content key={card._id} value={String(index)}>
                <Card>
                  <Button
                    className="float-end m-2"
                    variant="destructive"
                    onClick={() => onRemoveCard(index, field.onChange)}
                  >
                    <IconTrash />
                  </Button>
                  <div className="px-4">
                    <div className="w-full h-36 rounded-lg flex flex-col gap-2 items-center justify-center border-2 border-dashed ">
                      <IconPhotoScan className="w-24 h-24 text-accent-foreground" />
                      <Label>
                        Drag and Drop, choose from your Media library or upload
                      </Label>
                    </div>
                  </div>
                  <Card.Header className="grid gap-1 p-4">
                    <Card.Title>
                      <InputTextCounter
                        count={card.title?.length ?? 0}
                        limit={80}
                      />

                      <Input
                        value={card.title ?? ''}
                        onChange={(e) =>
                          onChangeCardInfo(
                            card._id,
                            {
                              title: e.currentTarget.value,
                            },
                            field.onChange,
                          )
                        }
                        placeholder="Enter a title"
                      />
                    </Card.Title>
                    <Card.Description>
                      <InputTextCounter
                        count={card.subtitle?.length ?? 0}
                        limit={80}
                      />

                      <Textarea
                        value={card.subtitle ?? ''}
                        onChange={(e) =>
                          onChangeCardInfo(
                            card._id,
                            {
                              subtitle: e.currentTarget.value,
                            },
                            field.onChange,
                          )
                        }
                        placeholder="Enter a subtitle"
                      />
                    </Card.Description>
                    <FacebookMessageButtonsGenerator
                      limit={3}
                      buttons={card.buttons || []}
                      setButtons={(buttons) =>
                        onChangeCardInfo(
                          card._id,
                          {
                            buttons,
                          },
                          field.onChange,
                        )
                      }
                    />
                  </Card.Header>
                </Card>
              </Tabs.Content>
            ))}
          </Tabs>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
