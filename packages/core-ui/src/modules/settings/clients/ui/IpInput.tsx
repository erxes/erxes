
import React, { useState } from 'react';

import Button from '../../../common/components/Button';
import { FormControl } from '../../../common/components/form';
import { Card, InputContainer, IpItem, IpList } from '../styles';




type Props = {
  initialIps?: string[];
  onChange?: (ips: string[]) => void;
};

export default function IpInput({ initialIps = [], onChange }: Props) {
  const [ips, setIps] = useState<string[]>(initialIps);
  const [newIp, setNewIp] = useState('');

  const isValidIp = (ip: string) => {
    return /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/.test(
      ip
    );
  };

  const addIp = () => {
    if (newIp && isValidIp(newIp) && !ips.includes(newIp)) {
      const updatedIps = [...ips, newIp];
      setIps(updatedIps);
      onChange?.(updatedIps);
      setNewIp('');
    }
  };

  const removeIp = (ip: string) => {
    const updatedIps = ips.filter((i) => i !== ip);
    setIps(updatedIps);
    onChange?.(updatedIps);
  };

  return (
    <Card>
      <InputContainer>
        <FormControl
          type='text'
          placeholder='Enter IP address'
          value={newIp}
          onChange={(e: any) => setNewIp(e.target.value)}
        />
        <Button onClick={addIp} disabled={!isValidIp(newIp)}>
          Add
        </Button>
      </InputContainer>

      {ips.length > 0 ? (
        <IpList>
          {ips.map((ip) => (
            <IpItem key={ip}>
              <span>{ip}</span>
              <Button
                btnStyle='simple'
                size='small'
                onClick={() => removeIp(ip)}
                icon='times-circle'
              />
            </IpItem>
          ))}
        </IpList>
      ) : (
        <p>No IPs whitelisted yet.</p>
      )}
    </Card>
  );
}
