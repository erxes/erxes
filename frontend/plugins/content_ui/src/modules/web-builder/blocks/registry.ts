import { BlockDefinition, BlockLevel } from './types';
import { headingBlock } from './atoms/Heading';
import { paragraphBlock } from './atoms/Paragraph';
import { buttonAtomBlock } from './atoms/ButtonAtom';
import { imageAtomBlock } from './atoms/ImageAtom';
import { spacerBlock } from './atoms/Spacer';
import { dividerBlock } from './atoms/Divider';
import { cardBlock } from './molecules/Card';
import { featureItemBlock } from './molecules/FeatureItem';
import { iconTextBlock } from './molecules/IconText';
import { heroBlock } from './organisms/Hero';
import { ctaBlock } from './organisms/CallToAction';
import { postsListBlock } from './organisms/PostsList';
import { categoryGridBlock } from './organisms/CategoryGrid';
import { menuBarBlock } from './organisms/MenuBar';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlockDefinition = BlockDefinition<any>;

const ALL: AnyBlockDefinition[] = [
  headingBlock,
  paragraphBlock,
  buttonAtomBlock,
  imageAtomBlock,
  spacerBlock,
  dividerBlock,
  cardBlock,
  featureItemBlock,
  iconTextBlock,
  heroBlock,
  ctaBlock,
  postsListBlock,
  categoryGridBlock,
  menuBarBlock,
];

export const BLOCK_REGISTRY: Record<string, AnyBlockDefinition> = ALL.reduce(
  (acc, b) => ({ ...acc, [b.key]: b }),
  {} as Record<string, AnyBlockDefinition>,
);

export const getBlocksByLevel = (level: BlockLevel) =>
  ALL.filter((b) => b.level === level);

export const getAllBlocks = () => ALL;

export const getBlockOrFallback = (key: string): AnyBlockDefinition | null =>
  BLOCK_REGISTRY[key] || null;
