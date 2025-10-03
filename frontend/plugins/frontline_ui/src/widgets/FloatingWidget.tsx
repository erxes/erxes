import { CallWidget } from '@/integrations/call/components/CallWidget';
import { SipContainer } from '@/integrations/call/components/SipContainer';

const FloatingWidget = () => {
  return (
    <SipContainer>
      <CallWidget />
    </SipContainer>
  );
};

export default FloatingWidget;
