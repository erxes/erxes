import type { ReactComponentImplementation } from '@erxes/assistant-catalog/react';
import { assistantCatalog } from '@erxes/assistant-catalog';
import { Chart } from './components/Chart';
import { ChoicePicker } from './components/choices';
import { Badge, Stat, Table } from './components/data';
import { Button, CheckBox, DateTimeInput, MemberPicker, TextField } from './components/inputs';
import { Column, Divider, List, Row, SurfaceCard, SurfaceTabs, Text } from './components/layout';

const page = { open: (_path: string) => undefined as void };

export const openPagesWith = (open: (path: string) => void) => {
  page.open = open;
};

export const uiCatalog = assistantCatalog<ReactComponentImplementation>(
  [
    Text,
    Row,
    Column,
    List,
    SurfaceCard,
    SurfaceTabs,
    Divider,
    Button,
    TextField,
    CheckBox,
    ChoicePicker,
    DateTimeInput,
    Stat,
    Badge,
    Table,
    Chart,
    MemberPicker,
  ],
  (path) => page.open(path),
);
