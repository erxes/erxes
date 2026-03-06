import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge, cn } from 'erxes-ui';
import React, { useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type TProps = {
  value: string;
  reTypeValue: string;
  errors?: Record<string, any>;
};

const PasswordStrength = ({ value, reTypeValue, errors }: TProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'change-password' });
  const id = useId();

  const checkStrength = (pass: string, reType: string) => {
    const requirements = [
      { regex: /.{8,}/, text: t('atleast-8') },
      { regex: /[0-9]/, text: t('least-number') },
      { regex: /[a-z]/, text: t('least-lowercase') },
      { regex: /[A-Z]/, text: t('least-uppercase') },
    ];

    const baseChecks = requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));

    const confirmCheck = {
      met: pass.length > 0 && pass === reType,
      text: t('password-same'),
    };

    return [...baseChecks, confirmCheck];
  };

  const strength = checkStrength(value, reTypeValue);

  // const strengthScore = useMemo(() => {
  //   return strength.filter((req) => req.met).length;
  // }, [strength]);

  // const getStrengthColor = (score: number) => {
  //   if (score === 0) return 'bg-border';
  //   if (score <= 1) return 'bg-red-500';
  //   if (score <= 2) return 'bg-orange-500';
  //   if (score === 3) return 'bg-amber-500';
  //   return 'bg-emerald-500';
  // };

  // const getStrengthText = (score: number) => {
  //   if (score === 0) return 'Enter a password';
  //   if (score <= 2) return 'Weak password';
  //   if (score === 3) return 'Medium password';
  //   return 'Strong password';
  // };

  // {/* <div
  //   className="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
  //   role="progressbar"
  //   aria-valuenow={strengthScore}
  //   aria-valuemin={0}
  //   aria-valuemax={5}
  //   aria-label="Password strength"
  // >
  //   <div
  //     className={`h-full ${getStrengthColor(
  //       strengthScore,
  //     )} transition-all duration-500 ease-out`}
  //     style={{ width: `${(strengthScore / 5) * 100}%` }}
  //   ></div>
  // </div> */}
  return (
    <div className="size-full p-2 flex flex-col items-start">
      {/* <p
        id={`${id}-description`}
        className="text-foreground mb-2 text-sm font-medium"
      >
        {getStrengthText(strengthScore)}. Must contain:
      </p> */}

      <ul className="space-y-1.5" aria-label="Password requirements">
        {strength.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.met ? (
              <IconCircleDashedCheck
                size={16}
                className="text-success"
                aria-hidden="true"
              />
            ) : (
              // ) : errors?.newPassword?.message === req.text ||
              //   errors?.reTypeNewPassword?.message === req.text ? (
              //   <IconCircleDashed
              //     size={16}
              //     className="text-destructive"
              //     aria-hidden="true"
              //   />
              <IconCircleDashed
                size={16}
                className="text-muted-foreground/80"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                req.met
                  ? 'text-success'
                  : // : errors?.newPassword?.message === req.text ||
                    //   errors?.reTypeNewPassword?.message === req.text
                    // ? 'text-destructive'
                    'text-muted-foreground',
                'text-xs',
              )}
              // className={`text-xs ${
              //   req.met ? 'text-emerald-600' : 'text-muted-foreground'
              // }`}
            >
              {req.text}
              <span className="sr-only">
                {req.met ? ' - Requirement met' : ' - Requirement not met'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
