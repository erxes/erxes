import { useEffect, useLayoutEffect, useState } from 'react';
import { hexToHsl, Input, Select, readImage } from 'erxes-ui';
import { useAtom } from 'jotai';
import { tmsFormAtom } from '~/modules/tms/atoms/formAtoms';

export const PreviewPage = () => {
  const [formData] = useAtom(tmsFormAtom);
  const [logoUrl, setLogoUrl] = useState('');

  useLayoutEffect(() => {
    if (formData.color && hexToHsl(formData.color)) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToHsl(formData.color) || '',
      );
    }
  }, [formData.color]);

  const tourName = formData.name || 'Tour Management System';

  useEffect(() => {
    if (formData.logo) {
      setLogoUrl(readImage(formData.logo));
    } else {
      setLogoUrl('https://placehold.co/150x150');
    }
  }, [formData.logo]);

  const themeColor = formData.color || '#4F46E5';

  return (
    <div className="flex flex-col justify-center items-center p-4 min-h-screen md:flex-row md:p-6">
      <div className="p-4 w-full max-w-md sm:max-w-lg md:w-1/2">
        <div className="p-4 mx-auto rounded-lg border shadow-md sm:p-6 bg-background">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src={logoUrl}
              alt="Company Logo"
              className="object-contain w-auto h-12"
            />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-center sm:text-xl text-foreground">
            Sign in to your account
          </h2>
          <p className="mb-4 text-sm text-center sm:mb-6 sm:text-base text-muted-foreground">
            Enter your email and password below to access your account.
          </p>
          <form className="space-y-3 sm:space-y-4">
            <Select value={tourName} disabled>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Select a branch" />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value={tourName}>{tourName}</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select>

            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm font-medium text-foreground sm:text-base"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value="info@erxes.io"
                disabled
                className="px-3 py-2 w-full text-sm rounded-md border bg-background text-foreground sm:text-base"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground sm:text-base mb-1.5"
                >
                  Password
                </label>
                <p
                  className="text-sm sm:text-base"
                  style={{ color: themeColor }}
                >
                  Forgot password?
                </p>
              </div>
              <Input
                id="password"
                type="password"
                value="••••••••"
                disabled
                className="px-3 py-2 w-full text-sm rounded-md border bg-background text-foreground sm:text-base"
              />
            </div>
            <button
              type="button"
              disabled
              className="px-4 py-1.5 mt-6 w-full text-sm text-white rounded-md sm:text-base"
              style={{ backgroundColor: themeColor }}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
