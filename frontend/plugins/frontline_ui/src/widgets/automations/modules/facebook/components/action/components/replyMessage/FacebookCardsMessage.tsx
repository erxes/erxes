import { useTranslation } from 'react-i18next';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Button, cn, Form, Input, Label, Textarea, Tooltip } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { FacebookMessageButtonsGenerator } from '../FacebookMessageButtonsGenerator';
import { FacebookMessageProps } from '../../types/messageActionForm';
import { FileUploadSection } from '../FileUploadSection';
import { InputTextCounter } from '../InputTextCounter';
import { TBotMessageCard } from '../../states/replyMessageActionForm';
import { generateAutomationElementId } from 'ui-modules';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

type TCardsChangeHandler = (cards: TBotMessageCard[]) => void;
type TCardPatch = Partial<Omit<TBotMessageCard, '_id'>>;

const CARD_TOOLTIP_TITLE_LIMIT = 48;
const CARD_TOOLTIP_DESCRIPTION_LIMIT = 96;

type TFacebookCardsMessageContext = {
  cards: TBotMessageCard[];
  selectedCard?: TBotMessageCard;
  selectedCardIndex: number;
  addPage: () => void;
  removeSelectedCard: () => void;
  reorderCards: (activeCardId: string, overCardId: string) => void;
  selectCard: (cardId: string) => void;
  updateSelectedCard: (newData: TCardPatch) => void;
};

const FacebookCardsMessageContext =
  createContext<TFacebookCardsMessageContext | null>(null);

const createCardPage = (index: number): TBotMessageCard => ({
  _id: generateAutomationElementId(),
  label: `Page ${index + 1}`,
  title: '',
  subtitle: '',
  buttons: [],
});

const normalizeCardLabels = (cards: TBotMessageCard[]): TBotMessageCard[] =>
  cards.map((card, index) => ({
    ...card,
    label: `Page ${index + 1}`,
  }));

const truncateCardText = (
  value: string | undefined,
  limit: number,
  fallback: string,
) => {
  const text = value?.trim() || fallback;

  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 3)}...`;
};

const resolveCards = (value: unknown): TBotMessageCard[] =>
  Array.isArray(value) ? value : [];

const useFacebookCardsMessage = () => {
  const context = useContext(FacebookCardsMessageContext);

  if (!context) {
    throw new Error(
      'useFacebookCardsMessage must be used within FacebookCardsMessageProvider',
    );
  }

  return context;
};

const FacebookCardsMessageProvider = ({
  cards,
  children,
  onCardsChange,
}: {
  cards: TBotMessageCard[];
  children: ReactNode;
  onCardsChange: TCardsChangeHandler;
}) => {
  const [activeCardId, setActiveCardId] = useState(cards[0]?._id ?? '');

  useEffect(() => {
    if (!cards.length) {
      setActiveCardId('');
      return;
    }

    if (!cards.some((card) => card._id === activeCardId)) {
      setActiveCardId(cards[0]._id);
    }
  }, [activeCardId, cards]);

  const selectedCard = useMemo(
    () => cards.find((card) => card._id === activeCardId) || cards[0],
    [activeCardId, cards],
  );

  const selectedCardIndex = useMemo(
    () =>
      selectedCard
        ? cards.findIndex((card) => card._id === selectedCard._id)
        : -1,
    [cards, selectedCard],
  );

  const addPage = useCallback(() => {
    const nextCard = createCardPage(cards.length);

    onCardsChange(normalizeCardLabels([...cards, nextCard]));
    setActiveCardId(nextCard._id);
  }, [cards, onCardsChange]);

  const removeSelectedCard = useCallback(() => {
    if (!selectedCard) {
      return;
    }

    const nextCards = normalizeCardLabels(
      cards.filter((card) => card._id !== selectedCard._id),
    );

    onCardsChange(nextCards);
    setActiveCardId(
      nextCards[Math.min(selectedCardIndex, nextCards.length - 1)]?._id ?? '',
    );
  }, [cards, onCardsChange, selectedCard, selectedCardIndex]);

  const reorderCards = useCallback(
    (activeCardId: string, overCardId: string) => {
      const oldIndex = cards.findIndex((card) => card._id === activeCardId);
      const newIndex = cards.findIndex((card) => card._id === overCardId);

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return;
      }

      onCardsChange(normalizeCardLabels(arrayMove(cards, oldIndex, newIndex)));
      setActiveCardId(activeCardId);
    },
    [cards, onCardsChange],
  );

  const selectCard = useCallback((cardId: string) => {
    setActiveCardId(cardId);
  }, []);

  const updateSelectedCard = useCallback(
    (newData: TCardPatch) => {
      if (!selectedCard) {
        return;
      }

      onCardsChange(
        cards.map((card) =>
          card._id === selectedCard._id ? { ...card, ...newData } : card,
        ),
      );
    },
    [cards, onCardsChange, selectedCard],
  );

  const value = useMemo(
    () => ({
      cards,
      selectedCard,
      selectedCardIndex,
      addPage,
      removeSelectedCard,
      reorderCards,
      selectCard,
      updateSelectedCard,
    }),
    [
      addPage,
      cards,
      removeSelectedCard,
      reorderCards,
      selectCard,
      selectedCard,
      selectedCardIndex,
      updateSelectedCard,
    ],
  );

  return (
    <FacebookCardsMessageContext.Provider value={value}>
      {children}
    </FacebookCardsMessageContext.Provider>
  );
};

const FacebookCardsMessageHeader = () => {
  const { t } = useTranslation('frontline');
  const { addPage, cards } = useFacebookCardsMessage();

  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{t('templates')}</Label>
      <div className="flex items-center gap-2">
        <InputTextCounter count={cards.length} limit={10} />
        <Button
          variant="outline"
          size="sm"
          disabled={cards.length >= 10}
          onClick={addPage}
        >
          <IconPlus className="size-3" /> {t('add-page')}
        </Button>
      </div>
    </div>
  );
};

const FacebookCardPageNumbers = () => {
  const { cards, reorderCards } = useFacebookCardsMessage();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      reorderCards(String(active.id), String(over.id));
    },
    [reorderCards],
  );

  if (!cards.length) {
    return null;
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={cards.map((card) => card._id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap gap-2">
            {cards.map((card, cardIndex) => (
              <FacebookCardPageNumber
                key={card._id}
                card={card}
                cardIndex={cardIndex}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Tooltip.Provider>
  );
};

const FacebookCardPageNumber = ({
  card,
  cardIndex,
}: {
  card: TBotMessageCard;
  cardIndex: number;
}) => {
  const { selectCard, selectedCard } = useFacebookCardsMessage();
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card._id });
  const isActive = selectedCard?._id === card._id;
  const tooltipTitle = truncateCardText(
    card.title,
    CARD_TOOLTIP_TITLE_LIMIT,
    card.label || `Page ${cardIndex + 1}`,
  );
  const tooltipDescription = truncateCardText(
    card.subtitle,
    CARD_TOOLTIP_DESCRIPTION_LIMIT,
    'No description',
  );

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <button
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
          }}
          {...attributes}
          {...listeners}
          aria-label={`Open ${card.label || `Page ${cardIndex + 1}`}`}
          type="button"
          className={cn(
            'grid size-8 place-items-center rounded-md border bg-background text-xs font-medium text-muted-foreground hover:bg-muted',
            isActive &&
              'border-primary bg-primary text-primary-foreground hover:bg-primary',
            isDragging && 'z-10 opacity-70 shadow-sm',
          )}
          onClick={() => selectCard(card._id)}
        >
          {cardIndex + 1}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-64 space-y-1" side="top">
        <p className="truncate font-medium">{tooltipTitle}</p>
        <p className="truncate text-background/75">{tooltipDescription}</p>
      </Tooltip.Content>
    </Tooltip>
  );
};

const FacebookSelectedCardMessageHeader = () => {
  const { cards, removeSelectedCard, selectedCard, selectedCardIndex } =
    useFacebookCardsMessage();

  if (!selectedCard) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {selectedCard.label || `Page ${selectedCardIndex + 1}`}
        </p>
        <p className="text-xs text-muted-foreground">
          Card {selectedCardIndex + 1} of {cards.length}
        </p>
      </div>
      <Button
        aria-label={`Remove ${selectedCard.label || `Page ${selectedCardIndex + 1}`}`}
        className="text-muted-foreground hover:text-destructive"
        disabled={cards.length <= 1}
        size="icon"
        variant="ghost"
        onClick={removeSelectedCard}
      >
        <IconTrash className="size-4" />
      </Button>
    </div>
  );
};

const FacebookSelectedCardImage = () => {
  const { selectedCard, updateSelectedCard } = useFacebookCardsMessage();

  if (!selectedCard) {
    return null;
  }

  return (
    <FileUploadSection
      url={selectedCard.image}
      onUpload={(fileUrl) =>
        updateSelectedCard({ image: fileUrl ?? undefined })
      }
    />
  );
};

const FacebookSelectedCardTitleField = () => {
  const { t } = useTranslation('frontline');
  const { selectedCard, updateSelectedCard } = useFacebookCardsMessage();

  if (!selectedCard) {
    return null;
  }

  return (
    <div className="space-y-2">
      <InputTextCounter count={selectedCard.title?.length ?? 0} limit={80} />

      <Input
        value={selectedCard.title ?? ''}
        onChange={(e) =>
          updateSelectedCard({
            title: e.currentTarget.value,
          })
        }
        placeholder={t('enter-a-title')}
      />
    </div>
  );
};

const FacebookSelectedCardSubtitleField = () => {
  const { t } = useTranslation('frontline');
  const { selectedCard, updateSelectedCard } = useFacebookCardsMessage();

  if (!selectedCard) {
    return null;
  }

  return (
    <div className="space-y-2">
      <InputTextCounter count={selectedCard.subtitle?.length ?? 0} limit={80} />

      <Textarea
        value={selectedCard.subtitle ?? ''}
        onChange={(e) =>
          updateSelectedCard({
            subtitle: e.currentTarget.value,
          })
        }
        placeholder={t('enter-a-subtitle')}
      />
    </div>
  );
};

const FacebookSelectedCardButtons = () => {
  const { selectedCard, updateSelectedCard } = useFacebookCardsMessage();

  if (!selectedCard) {
    return null;
  }

  return (
    <FacebookMessageButtonsGenerator
      limit={3}
      buttons={selectedCard.buttons || []}
      setButtons={(buttons) =>
        updateSelectedCard({
          buttons,
        })
      }
    />
  );
};

const FacebookSelectedCardMessage = () => (
  <div className="min-w-0 space-y-4">
    <FacebookSelectedCardMessageHeader />
    <FacebookSelectedCardImage />
    <FacebookSelectedCardTitleField />
    <FacebookSelectedCardSubtitleField />
    <FacebookSelectedCardButtons />
  </div>
);

const FacebookSelectedCardMessagePlaceholder = () => {
  const { t } = useTranslation('frontline');
  const { addPage, cards } = useFacebookCardsMessage();

  return (
    <div className="grid min-h-48 place-items-center rounded-md border border-dashed bg-muted/30 p-6">
      <Button
        variant="outline"
        disabled={cards.length >= 10}
        onClick={addPage}
      >
        <IconPlus className="size-4" /> {t('add-page')}
      </Button>
    </div>
  );
};

const FacebookCardsMessageContent = () => {
  const { selectedCard } = useFacebookCardsMessage();

  return (
    <>
      <FacebookCardsMessageHeader />
      <div className="space-y-4">
        <FacebookCardPageNumbers />
        {selectedCard ? (
          <FacebookSelectedCardMessage />
        ) : (
          <FacebookSelectedCardMessagePlaceholder />
        )}
      </div>
    </>
  );
};

export const FacebookCardsMessage = ({
  index,
}: FacebookMessageProps<{ type: 'card' }>) => {
  const { t } = useTranslation('frontline');
  const { control } = useReplyMessageAction();

  return (
    <Form.Field
      control={control}
      name={`messages.${index}.cards`}
      render={({ field }) => (
        <Form.Item>
          <FacebookCardsMessageProvider
            cards={resolveCards(field.value)}
            onCardsChange={(cards) => field.onChange(cards)}
          >
            <FacebookCardsMessageContent />
          </FacebookCardsMessageProvider>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
