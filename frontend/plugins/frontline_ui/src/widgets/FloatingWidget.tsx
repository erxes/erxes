import { CallWidget } from '@/integrations/call/components/CallWidget';
import { SipContainer } from '@/integrations/call/components/SipContainer';
import { DirectMailComposer } from '@/integrations/mail/components/DirectMailComposer';

const FloatingWidget = () => {
  return (
    <>
      <SipContainer>
        <CallWidget />
      </SipContainer>
      <DirectMailComposer />
    </>
  );
};

export default FloatingWidget;
