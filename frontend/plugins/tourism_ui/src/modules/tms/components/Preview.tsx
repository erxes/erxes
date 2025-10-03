import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconWifi,
  IconAntennaBars5,
  IconBattery,
} from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { useState } from 'react';
import { TmsFormType } from '@/tms/constants/formSchema';

type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface PreviewProps {
  formData?: Partial<TmsFormType>;
}

export default function Preview({ formData }: PreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');

  const tourName = formData?.name || 'Таны тур оператор';
  const themeColor = formData?.color || '#4F46E5';
  const logoUrl =
    formData?.logo ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbvwVAC3F5xurW6mtfMrEoeWvuQpisg17tNg&s';

  const renderLoginForm = () => {
    return (
      <div className="max-w-[80vh] p-6 mx-auto bg-white rounded-md shadow-md">
        <div className="flex items-center justify-center mb-6">
          <img src={logoUrl} alt="Company Logo" width={100} height={30} />
        </div>

        <div className="mb-4">
          <h2 className="mb-1 text-xl font-semibold">
            Sign in to your account
          </h2>
          <p className="text-sm text-gray-500">
            Enter your email and password below to access your account.
          </p>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            value={tourName}
            disabled
            className="w-full p-2 text-black border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Email</label>
          <Input
            type="email"
            value="info@erxes.io"
            disabled
            className="w-full p-2 text-black border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm">Password</label>
            <span className="text-xs text-gray-600">Forgot password?</span>
          </div>
          <Input
            type="password"
            value="••••••••"
            disabled
            className="w-full p-2 text-black border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <Button
          disabled
          className="w-full px-4 py-2"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
        >
          Sign in
        </Button>
      </div>
    );
  };

  const renderDeviceFrame = () => {
    switch (activeDevice) {
      case 'desktop':
        return (
          <div className="flex flex-col w-full h-full overflow-hidden bg-white rounded-md shadow-lg">
            <div className="flex items-center h-8 px-3 bg-gray-100 border-b border-[#F4F4F5]">
              <div className="flex mr-4 space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 h-5 bg-white rounded-md"></div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex items-center justify-center w-full h-full rounded-md bg-gray-50">
                {renderLoginForm()}
              </div>
            </div>
          </div>
        );

      case 'mobile':
        return (
          <div className="flex flex-col w-64 mx-auto bg-black shadow-lg h-[500px] rounded-3xl overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 text-white bg-black h-7">
              <div className="text-xs">9:41</div>
              <div className="flex space-x-1.5 items-center">
                <IconAntennaBars5 size={12} />
                <IconWifi size={12} />
                <IconBattery size={14} />
              </div>
            </div>
            {/* Notch */}
            <div className="relative h-6 bg-black">
              <div className="absolute w-32 h-6 -translate-x-1/2 bg-black rounded-b-lg left-1/2"></div>
            </div>
            {/* Content */}
            <div className="flex-1 p-2 overflow-auto bg-white">
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="transform scale-[0.65]">
                  {renderLoginForm()}
                </div>
              </div>
            </div>
            {/* Home indicator */}
            <div className="flex items-center justify-center h-6 bg-white">
              <div className="h-1 bg-gray-400 rounded-full w-28"></div>
            </div>
          </div>
        );

      case 'tablet':
        return (
          <div className="flex flex-col mx-auto bg-black shadow-lg w-[500px] h-[350px] rounded-xl overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between h-6 px-4 text-white bg-black">
              <div className="text-xs">9:41</div>
              <div className="flex space-x-1.5 items-center">
                <IconAntennaBars5 size={12} />
                <IconWifi size={12} />
                <IconBattery size={14} />
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 p-4 overflow-auto bg-white">
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="transform scale-[0.8]">{renderLoginForm()}</div>
              </div>
            </div>
            {/* Home button */}
            <div className="flex items-center justify-center h-8 bg-black">
              <div className="w-6 h-6 border border-gray-400 rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gray-100">
      <div className="flex h-12 justify-center items-center border-b border-[#E4E4E7] bg-white">
        {(['desktop', 'mobile', 'tablet'] as DeviceType[]).map((device) => (
          <div
            key={device}
            className={`flex px-4 py-2 justify-center items-center gap-2 cursor-pointer transition-all ${
              activeDevice === device ? 'border-b-2 border-[#4F46E5]' : ''
            }`}
            onClick={() => setActiveDevice(device)}
          >
            {device === 'desktop' && (
              <IconDeviceDesktop
                size={20}
                className={
                  activeDevice === device ? 'text-[#4F46E5]' : 'text-[#71717A]'
                }
              />
            )}
            {device === 'mobile' && (
              <IconDeviceMobile
                size={20}
                className={
                  activeDevice === device ? 'text-[#4F46E5]' : 'text-[#71717A]'
                }
              />
            )}
            {device === 'tablet' && (
              <IconDeviceTablet
                size={20}
                className={
                  activeDevice === device ? 'text-[#4F46E5]' : 'text-[#71717A]'
                }
              />
            )}
            <p
              className={`text-[14px] font-semibold ${
                activeDevice === device ? 'text-[#4F46E5]' : 'text-[#71717A]'
              }`}
            >
              {device.charAt(0).toUpperCase() + device.slice(1)}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 flex justify-center items-center h-[calc(100%-3rem)]">
        {renderDeviceFrame()}
      </div>
    </div>
  );
}
