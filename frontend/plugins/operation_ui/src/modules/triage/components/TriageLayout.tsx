import { Resizable, useIsMobile } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { TriageHeader } from './TriageHeader';
import { TriageContent } from './TriageContent';
import { Triages } from './TriageList';

export const TriageLayout = () => {
  const isMobile = useIsMobile();
  const { triageId } = useParams();

  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {triageId ? (
          <>
            <TriageHeader />
            <TriageContent />
          </>
        ) : (
          <Triages />
        )}
      </div>
    );
  }
  return (
    <Resizable.PanelGroup
      direction="horizontal"
      className="flex-1 overflow-hidden"
    >
      <Resizable.Panel
        minSize={20}
        defaultSize={30}
        className="hidden sm:flex min-w-80 max-w-lg"
      >
        <Triages />
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel minSize={20} defaultSize={70}>
        <TriageContent />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
