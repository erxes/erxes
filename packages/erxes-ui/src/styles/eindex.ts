import * as chooser from './chooser';
import colors from './colors';
import dimensions from './dimensions';
import * as color from './ecolor';
import * as mainStyles from './main';
import * as sort from './sort';
import typography from './typography';

const ChooserColumns = chooser.Columns;
const ChooserColumn = chooser.Column;
const ChooserTitle = chooser.Title;
const ChooserFooter = chooser.Footer;
const ChooserSelect = chooser.Select;
const ChooserActionTop = chooser.ActionTop;

export { ChooserColumns, ChooserColumn, ChooserTitle, ChooserFooter, ChooserSelect, ChooserActionTop };

const MainStyleActions = mainStyles.Actions;
const PopoverButton = mainStyles.PopoverButton;
const MainStyleBoxRoot = mainStyles.BoxRoot;
const MainStyleFullContent = mainStyles.FullContent;
const MainStyleModalFooter = mainStyles.ModalFooter;
const MainStyleInfoWrapper = mainStyles.InfoWrapper;
const MainStyleLinks = mainStyles.Links;
const MainStyleFormWrapper = mainStyles.FormWrapper;
const MainStyleFormColumn = mainStyles.FormColumn;
const MainStyleCenterContent = mainStyles.CenterContent;
const MainStyleActivityContent = mainStyles.ActivityContent;
const MainStyleDropIcon = mainStyles.DropIcon;
const MainStyleMiddleContent = mainStyles.MiddleContent;
const MainStyleHomeContainer = mainStyles.HomeContainer;
const MainStyleDateWrapper = mainStyles.DateWrapper;
const MainStyleCloseModal = mainStyles.CloseModal;
const MainStyleScrollWrapper = mainStyles.ScrollWrapper;
const MainStyleDateContainer = mainStyles.DateContainer;
const MainStyleTabContent = mainStyles.TabContent;
const MainStyleButtonRelated = mainStyles.ButtonRelated;
const MainStyleSimpleButton = mainStyles.SimpleButton;
const MainStyleTopHeader = mainStyles.TopHeader;
const MainStyleTitle = mainStyles.Title;
const MainStyleCount = mainStyles.Count;
const MainStyleLimited = mainStyles.Limited;

export {
  MainStyleActions,
  PopoverButton,
  MainStyleBoxRoot,
  MainStyleFullContent,
  MainStyleModalFooter,
  MainStyleInfoWrapper,
  MainStyleLinks,
  MainStyleFormWrapper,
  MainStyleFormColumn,
  MainStyleCenterContent,
  MainStyleActivityContent,
  MainStyleDropIcon,
  MainStyleMiddleContent,
  MainStyleHomeContainer,
  MainStyleDateWrapper,
  MainStyleCloseModal,
  MainStyleScrollWrapper,
  MainStyleDateContainer,
  MainStyleTabContent,
  MainStyleButtonRelated,
  MainStyleSimpleButton,
  MainStyleTopHeader,
  MainStyleTitle,
  MainStyleCount,
  MainStyleLimited
};

const SortItem = sort.SortItem;
const SortableWrapper = sort.SortableWrapper;
const DragHandler = sort.DragHandler;

export { SortItem, SortableWrapper, DragHandler };

export { colors, dimensions, typography, chooser, color, mainStyles, sort };