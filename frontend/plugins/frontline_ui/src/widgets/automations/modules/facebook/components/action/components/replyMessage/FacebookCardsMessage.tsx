import { IconPhotoScan, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Card, Form, Input, Label, Tabs, Textarea } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import { TBotMessageCard } from '../../states/replyMessageActionForm';
import { FacebookMessageProps } from '../../types/messageActionForm';
import { FacebookMessageButtonsGenerator } from '../FacebookMessageButtonsGenerator';
import { InputTextCounter } from '../InputTextCounter';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { FileUploadSection } from '../FileUploadSection';

export const FacebookCardsMessage = ({
  message,
  index,
}: FacebookMessageProps<{ type: 'card' }>) => {
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
        <Form.Item>
          <div className="flex justify-between items-center">
            <Label>Templates</Label>
            <div className="flex items-center gap-2">
              <InputTextCounter count={cards.length} limit={10} />
              <Button
                variant="outline"
                size="sm"
                disabled={cards.length >= 10}
                onClick={() => addPage(field.onChange)}
              >
                <IconPlus className="size-3" /> Add page
              </Button>
            </div>
          </div>
          <Tabs defaultValue="0">
            <div className="overflow-x-auto px-2 pb-2">
              <Tabs.List>
                {cards.map((_, index) => (
                  <Tabs.Trigger key={index} value={String(index)} asChild>
                    <div className="flex items-center gap-2">
                      {`${index + 1} Page`}
                      <Button
                        className="hover:text-destructive"
                        variant="link"
                        size="sm"
                        onClick={() => onRemoveCard(index, field.onChange)}
                      >
                        <IconX className="size-3" />
                      </Button>
                    </div>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>
            {cards.map((card, index) => (
              <Tabs.Content key={card._id} value={String(index)}>
                <div className="px-4">
                  <FileUploadSection
                    url={card.image}
                    onUpload={(fileUrl) => {
                      console.log(fileUrl);
                      onChangeCardInfo(
                        card._id,
                        { image: fileUrl },
                        field.onChange,
                      );
                    }}
                  />
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
              </Tabs.Content>
            ))}
          </Tabs>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
