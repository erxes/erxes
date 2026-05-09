import * as React from 'react';
import { Box, Heading, Image, Text } from '../atoms';
import { BreadcrumbBar, KeyValueRow, StatCard } from '../molecules';
import {
  ContentSection,
  LayoutFooter,
  LayoutHeader,
  StatGroup,
} from '../organisms';

export type RegistryComponent = React.ComponentType<any>;

export const componentRegistry: Record<string, RegistryComponent> = {
  // atoms
  box: Box,
  heading: Heading,
  text: Text,
  image: Image,
  // molecules
  statCard: StatCard,
  breadcrumbBar: BreadcrumbBar,
  keyValueRow: KeyValueRow,
  // organisms
  statGroup: StatGroup,
  contentSection: ContentSection,
  layoutHeader: LayoutHeader,
  layoutFooter: LayoutFooter,
};

export function resolve(name: string): RegistryComponent {
  const cmp = componentRegistry[name];
  if (!cmp) {
    throw new Error(
      `[layout_ui] Unknown component "${name}". Register it in componentRegistry.ts`,
    );
  }
  return cmp;
}
