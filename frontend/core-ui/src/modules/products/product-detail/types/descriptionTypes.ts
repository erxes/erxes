export interface BlockStyles {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlignment?: string;
    [key: string]: any;
  }

  export interface TextContent {
    type: 'text';
    text: string;
    styles: BlockStyles;
  }

  export interface Block {
    id: string;
    type: string;
    props?: {
      textColor?: string;
      backgroundColor?: string;
      textAlignment?: string;
    };
    content: TextContent[] | string;
    children: Block[];
  }
  export interface DescriptionInputProps {
    initialContent?: string;
    onSave?: (text: string) => void;
    placeholder?: string;
  }
  export interface BlockEditorType {
    document: Block[];
    tryParseMarkdownToBlocks: (markdown: string) => Promise<Block[]>;
    replaceBlocks: (targetBlocks: Block[], newBlocks: Block[]) => void;
    mergeBlocks: (targetBlock: Block, blockToMerge: Block) => void;
    splitBlock: (block: Block, index: number) => Block[];
    reserializeBlocks: (blocks: Block[]) => string;
  }
