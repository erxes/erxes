import {
  IconAccessible,
  IconAirConditioning,
  IconAirBalloon,
  IconAlarmSmoke,
  IconAnchor,
  IconBabyCarriage,
  IconBabyBottle,
  IconBackpack,
  IconBallFootball,
  IconBallTennis,
  IconBalloon,
  IconBarbell,
  IconBath,
  IconBeach,
  IconBed,
  IconBellRinging,
  IconBike,
  IconBottle,
  IconBrandTabler,
  IconBrandBooking,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBus,
  IconCampfire,
  IconCamera,
  IconCar,
  IconCaravan,
  IconChefHat,
  IconChargingPile,
  IconCoffee,
  IconCompass,
  IconCloudRain,
  IconCloudSnow,
  IconDroplet,
  IconDeviceTv,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDisabled,
  IconDog,
  IconEmergencyBed,
  IconEscalator,
  IconElevator,
  IconFireExtinguisher,
  IconFirstAidKit,
  IconFlame,
  IconFridge,
  IconFlower,
  IconGlassFull,
  IconGift,
  IconHeadphones,
  IconHeartbeat,
  IconHomeEco,
  IconIroning1,
  IconKey,
  IconLifebuoy,
  IconLock,
  IconLuggage,
  IconMap2,
  IconMapPin,
  IconMapSearch,
  IconMeat,
  IconMassage,
  IconMicrowave,
  IconMicrophone,
  IconMoonStars,
  IconMovie,
  IconMotorbike,
  IconMountain,
  IconMug,
  IconMusic,
  IconNavigation,
  IconPhoneCalling,
  IconParking,
  IconPaw,
  IconPalette,
  IconPhoto,
  IconPlane,
  IconPlayCard,
  IconPlug,
  IconPool,
  IconPuzzle2,
  IconQrcode,
  IconReceipt,
  IconRoute,
  IconRouter,
  IconRun,
  IconSalad,
  IconShoppingBag,
  IconShieldCheck,
  IconShip,
  IconSnowflake,
  IconSofa,
  IconSpeakerphone,
  IconStairs,
  IconStars,
  IconSun,
  IconSunrise,
  IconSunset,
  IconSwimming,
  IconTent,
  IconTicket,
  IconToiletPaper,
  IconToolsKitchen2,
  IconTrain,
  IconTrees,
  IconUmbrella,
  IconUsersGroup,
  IconVideo,
  IconWalk,
  IconWashMachine,
  IconWheelchair,
  IconWifi,
  IconWind,
  IconBinoculars,
} from '@tabler/icons-react';
import { Combobox, Command, IconComponent, Popover, cn } from 'erxes-ui';
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useState,
} from 'react';

type AmenityIconComponent = typeof IconBrandTabler;

type AmenityIconOption = {
  name: string;
  label: string;
  keywords: string[];
  icon: AmenityIconComponent;
};

export const amenityIconOptions: AmenityIconOption[] = [
  {
    name: 'IconWifi',
    label: 'WiFi',
    keywords: ['internet', 'wireless', 'network'],
    icon: IconWifi,
  },
  {
    name: 'IconPool',
    label: 'Pool',
    keywords: ['water', 'swim'],
    icon: IconPool,
  },
  {
    name: 'IconSwimming',
    label: 'Swimming',
    keywords: ['pool', 'water', 'activity'],
    icon: IconSwimming,
  },
  {
    name: 'IconParking',
    label: 'Parking',
    keywords: ['car', 'vehicle', 'garage'],
    icon: IconParking,
  },
  {
    name: 'IconAirConditioning',
    label: 'Air Conditioning',
    keywords: ['ac', 'cooling', 'climate'],
    icon: IconAirConditioning,
  },
  {
    name: 'IconBath',
    label: 'Bath',
    keywords: ['bathroom', 'shower', 'tub'],
    icon: IconBath,
  },
  {
    name: 'IconBed',
    label: 'Bed',
    keywords: ['sleep', 'room', 'stay'],
    icon: IconBed,
  },
  {
    name: 'IconCoffee',
    label: 'Coffee',
    keywords: ['breakfast', 'drink', 'cafe'],
    icon: IconCoffee,
  },
  {
    name: 'IconDeviceTv',
    label: 'TV',
    keywords: ['television', 'entertainment', 'screen'],
    icon: IconDeviceTv,
  },
  {
    name: 'IconMapPin',
    label: 'Location',
    keywords: ['map', 'place', 'destination'],
    icon: IconMapPin,
  },
  {
    name: 'IconElevator',
    label: 'Elevator',
    keywords: ['lift', 'access'],
    icon: IconElevator,
  },
  {
    name: 'IconAccessible',
    label: 'Accessible',
    keywords: ['accessibility', 'friendly'],
    icon: IconAccessible,
  },
  {
    name: 'IconWheelchair',
    label: 'Wheelchair',
    keywords: ['accessible', 'mobility'],
    icon: IconWheelchair,
  },
  {
    name: 'IconPaw',
    label: 'Pet Friendly',
    keywords: ['animal', 'pet', 'friendly'],
    icon: IconPaw,
  },
  {
    name: 'IconDog',
    label: 'Dog Friendly',
    keywords: ['animal', 'pet', 'dog'],
    icon: IconDog,
  },
  {
    name: 'IconBabyCarriage',
    label: 'Baby Friendly',
    keywords: ['family', 'child', 'stroller'],
    icon: IconBabyCarriage,
  },
  {
    name: 'IconLuggage',
    label: 'Luggage',
    keywords: ['bag', 'travel', 'baggage'],
    icon: IconLuggage,
  },
  {
    name: 'IconSofa',
    label: 'Lounge',
    keywords: ['seat', 'sofa', 'rest'],
    icon: IconSofa,
  },
  {
    name: 'IconBeach',
    label: 'Beach',
    keywords: ['sea', 'sand', 'coast'],
    icon: IconBeach,
  },
  {
    name: 'IconMountain',
    label: 'Mountain View',
    keywords: ['hill', 'nature', 'scenery'],
    icon: IconMountain,
  },
  {
    name: 'IconTrees',
    label: 'Forest',
    keywords: ['park', 'nature', 'green'],
    icon: IconTrees,
  },
  {
    name: 'IconTent',
    label: 'Camping',
    keywords: ['camp', 'outdoor', 'glamping'],
    icon: IconTent,
  },
  {
    name: 'IconCampfire',
    label: 'Campfire',
    keywords: ['fire', 'camping', 'bonfire'],
    icon: IconCampfire,
  },
  {
    name: 'IconCar',
    label: 'Car Access',
    keywords: ['transport', 'drive', 'taxi'],
    icon: IconCar,
  },
  {
    name: 'IconBus',
    label: 'Bus Access',
    keywords: ['transport', 'shuttle', 'public'],
    icon: IconBus,
  },
  {
    name: 'IconTrain',
    label: 'Train Access',
    keywords: ['transport', 'railway', 'station'],
    icon: IconTrain,
  },
  {
    name: 'IconPlane',
    label: 'Airport Transfer',
    keywords: ['airport', 'flight', 'transfer'],
    icon: IconPlane,
  },
  {
    name: 'IconBike',
    label: 'Bike Rental',
    keywords: ['bicycle', 'cycling', 'rental'],
    icon: IconBike,
  },
  {
    name: 'IconMotorbike',
    label: 'Motorbike',
    keywords: ['scooter', 'bike', 'rental'],
    icon: IconMotorbike,
  },
  {
    name: 'IconCaravan',
    label: 'Caravan Parking',
    keywords: ['rv', 'camper', 'parking'],
    icon: IconCaravan,
  },
  {
    name: 'IconBrandBooking',
    label: 'Online Booking',
    keywords: ['reservation', 'booking', 'hotel'],
    icon: IconBrandBooking,
  },
  {
    name: 'IconToolsKitchen2',
    label: 'Kitchen',
    keywords: ['cooking', 'kitchenette', 'meal'],
    icon: IconToolsKitchen2,
  },
  {
    name: 'IconChefHat',
    label: 'Restaurant',
    keywords: ['food', 'chef', 'dining'],
    icon: IconChefHat,
  },
  {
    name: 'IconFridge',
    label: 'Fridge',
    keywords: ['refrigerator', 'cold', 'kitchen'],
    icon: IconFridge,
  },
  {
    name: 'IconMicrowave',
    label: 'Microwave',
    keywords: ['kitchen', 'heating', 'food'],
    icon: IconMicrowave,
  },
  {
    name: 'IconMeat',
    label: 'BBQ',
    keywords: ['barbecue', 'grill', 'food'],
    icon: IconMeat,
  },
  {
    name: 'IconSalad',
    label: 'Healthy Food',
    keywords: ['vegan', 'vegetarian', 'meal'],
    icon: IconSalad,
  },
  {
    name: 'IconBottle',
    label: 'Drinks',
    keywords: ['water', 'beverage', 'bar'],
    icon: IconBottle,
  },
  {
    name: 'IconGlassFull',
    label: 'Bar',
    keywords: ['drink', 'cocktail', 'beverage'],
    icon: IconGlassFull,
  },
  {
    name: 'IconMug',
    label: 'Tea',
    keywords: ['coffee', 'hot drink', 'breakfast'],
    icon: IconMug,
  },
  {
    name: 'IconWashMachine',
    label: 'Laundry',
    keywords: ['washer', 'cleaning', 'clothes'],
    icon: IconWashMachine,
  },
  {
    name: 'IconIroning1',
    label: 'Iron',
    keywords: ['ironing', 'clothes', 'laundry'],
    icon: IconIroning1,
  },
  {
    name: 'IconToiletPaper',
    label: 'Restroom',
    keywords: ['toilet', 'wc', 'bathroom'],
    icon: IconToiletPaper,
  },
  {
    name: 'IconSnowflake',
    label: 'Cooling',
    keywords: ['cold', 'winter', 'air conditioning'],
    icon: IconSnowflake,
  },
  {
    name: 'IconFlame',
    label: 'Heating',
    keywords: ['warm', 'fireplace', 'heater'],
    icon: IconFlame,
  },
  {
    name: 'IconSun',
    label: 'Sunny Terrace',
    keywords: ['sunlight', 'terrace', 'outdoor'],
    icon: IconSun,
  },
  {
    name: 'IconMoonStars',
    label: 'Night Stay',
    keywords: ['night', 'sleep', 'sky'],
    icon: IconMoonStars,
  },
  {
    name: 'IconStars',
    label: 'Premium',
    keywords: ['luxury', 'rating', 'star'],
    icon: IconStars,
  },
  {
    name: 'IconPhoto',
    label: 'Photo Spot',
    keywords: ['gallery', 'viewpoint', 'picture'],
    icon: IconPhoto,
  },
  {
    name: 'IconCamera',
    label: 'Photography',
    keywords: ['camera', 'photo', 'media'],
    icon: IconCamera,
  },
  {
    name: 'IconVideo',
    label: 'Video',
    keywords: ['cinema', 'tv', 'media'],
    icon: IconVideo,
  },
  {
    name: 'IconHeadphones',
    label: 'Audio Guide',
    keywords: ['music', 'headset', 'guide'],
    icon: IconHeadphones,
  },
  {
    name: 'IconSpeakerphone',
    label: 'Announcements',
    keywords: ['speaker', 'event', 'audio'],
    icon: IconSpeakerphone,
  },
  {
    name: 'IconMap2',
    label: 'Tour Map',
    keywords: ['navigation', 'map', 'route'],
    icon: IconMap2,
  },
  {
    name: 'IconNavigation',
    label: 'Navigation',
    keywords: ['direction', 'guide', 'location'],
    icon: IconNavigation,
  },
  {
    name: 'IconRoute',
    label: 'Route',
    keywords: ['trip', 'path', 'journey'],
    icon: IconRoute,
  },
  {
    name: 'IconAnchor',
    label: 'Boat Access',
    keywords: ['dock', 'ship', 'water'],
    icon: IconAnchor,
  },
  {
    name: 'IconShip',
    label: 'Boat Tour',
    keywords: ['ship', 'cruise', 'water'],
    icon: IconShip,
  },
  {
    name: 'IconHomeEco',
    label: 'Eco Stay',
    keywords: ['green', 'eco', 'sustainable'],
    icon: IconHomeEco,
  },
  {
    name: 'IconPlug',
    label: 'Power Outlet',
    keywords: ['electricity', 'charger', 'socket'],
    icon: IconPlug,
  },
  {
    name: 'IconChargingPile',
    label: 'EV Charging',
    keywords: ['electric car', 'charger', 'vehicle'],
    icon: IconChargingPile,
  },
  {
    name: 'IconKey',
    label: 'Private Access',
    keywords: ['room key', 'entry', 'private'],
    icon: IconKey,
  },
  {
    name: 'IconLock',
    label: 'Secure',
    keywords: ['safe', 'locked', 'security'],
    icon: IconLock,
  },
  {
    name: 'IconShieldCheck',
    label: 'Security',
    keywords: ['protection', 'safety', 'secure'],
    icon: IconShieldCheck,
  },
  {
    name: 'IconAlarmSmoke',
    label: 'Smoke Alarm',
    keywords: ['fire', 'safety', 'alarm'],
    icon: IconAlarmSmoke,
  },
  {
    name: 'IconFireExtinguisher',
    label: 'Fire Safety',
    keywords: ['emergency', 'fire', 'safety'],
    icon: IconFireExtinguisher,
  },
  {
    name: 'IconFirstAidKit',
    label: 'First Aid',
    keywords: ['medical', 'aid', 'health'],
    icon: IconFirstAidKit,
  },
  {
    name: 'IconHeartbeat',
    label: 'Health Support',
    keywords: ['medical', 'wellness', 'health'],
    icon: IconHeartbeat,
  },
  {
    name: 'IconEmergencyBed',
    label: 'Medical Room',
    keywords: ['health', 'emergency', 'bed'],
    icon: IconEmergencyBed,
  },
  {
    name: 'IconLifebuoy',
    label: 'Rescue',
    keywords: ['safety', 'water', 'emergency'],
    icon: IconLifebuoy,
  },
  {
    name: 'IconDisabled',
    label: 'Disability Access',
    keywords: ['accessible', 'special needs', 'mobility'],
    icon: IconDisabled,
  },
  {
    name: 'IconStairs',
    label: 'Stairs',
    keywords: ['steps', 'level', 'floor'],
    icon: IconStairs,
  },
  {
    name: 'IconEscalator',
    label: 'Escalator',
    keywords: ['stairs', 'lift', 'mall'],
    icon: IconEscalator,
  },
  {
    name: 'IconBellRinging',
    label: 'Reception Bell',
    keywords: ['service', 'desk', 'concierge'],
    icon: IconBellRinging,
  },
  {
    name: 'IconMassage',
    label: 'Massage',
    keywords: ['spa', 'wellness', 'relax'],
    icon: IconMassage,
  },
  {
    name: 'IconDroplet',
    label: 'Spa',
    keywords: ['wellness', 'water', 'relax'],
    icon: IconDroplet,
  },
  {
    name: 'IconUmbrella',
    label: 'Beach Umbrella',
    keywords: ['shade', 'outdoor', 'beach'],
    icon: IconUmbrella,
  },
  {
    name: 'IconWind',
    label: 'Windy View',
    keywords: ['weather', 'breeze', 'outdoor'],
    icon: IconWind,
  },
  {
    name: 'IconCloudRain',
    label: 'Rainy Season',
    keywords: ['weather', 'rain', 'forecast'],
    icon: IconCloudRain,
  },
  {
    name: 'IconCloudSnow',
    label: 'Snow Activity',
    keywords: ['weather', 'winter', 'snow'],
    icon: IconCloudSnow,
  },
  {
    name: 'IconSunrise',
    label: 'Sunrise View',
    keywords: ['morning', 'view', 'nature'],
    icon: IconSunrise,
  },
  {
    name: 'IconSunset',
    label: 'Sunset View',
    keywords: ['evening', 'view', 'nature'],
    icon: IconSunset,
  },
  {
    name: 'IconFlower',
    label: 'Garden',
    keywords: ['flowers', 'nature', 'park'],
    icon: IconFlower,
  },
  {
    name: 'IconAirBalloon',
    label: 'Balloon Tour',
    keywords: ['adventure', 'sky', 'tour'],
    icon: IconAirBalloon,
  },
  {
    name: 'IconBackpack',
    label: 'Hiking',
    keywords: ['trek', 'travel', 'outdoor'],
    icon: IconBackpack,
  },
  {
    name: 'IconBinoculars',
    label: 'Sightseeing',
    keywords: ['view', 'watching', 'tour'],
    icon: IconBinoculars,
  },
  {
    name: 'IconCompass',
    label: 'Explorer',
    keywords: ['direction', 'adventure', 'tour'],
    icon: IconCompass,
  },
  {
    name: 'IconRun',
    label: 'Running',
    keywords: ['fitness', 'sport', 'activity'],
    icon: IconRun,
  },
  {
    name: 'IconWalk',
    label: 'Walking Tour',
    keywords: ['hike', 'walk', 'activity'],
    icon: IconWalk,
  },
  {
    name: 'IconBarbell',
    label: 'Gym',
    keywords: ['fitness', 'workout', 'sport'],
    icon: IconBarbell,
  },
  {
    name: 'IconBallFootball',
    label: 'Football',
    keywords: ['soccer', 'sport', 'play'],
    icon: IconBallFootball,
  },
  {
    name: 'IconBallTennis',
    label: 'Tennis',
    keywords: ['sport', 'court', 'play'],
    icon: IconBallTennis,
  },
  {
    name: 'IconBalloon',
    label: 'Kids Play',
    keywords: ['children', 'family', 'fun'],
    icon: IconBalloon,
  },
  {
    name: 'IconBabyBottle',
    label: 'Baby Care',
    keywords: ['family', 'infant', 'child'],
    icon: IconBabyBottle,
  },
  {
    name: 'IconPlayCard',
    label: 'Game Room',
    keywords: ['cards', 'game', 'fun'],
    icon: IconPlayCard,
  },
  {
    name: 'IconPuzzle2',
    label: 'Kids Activities',
    keywords: ['puzzle', 'family', 'play'],
    icon: IconPuzzle2,
  },
  {
    name: 'IconDeviceLaptop',
    label: 'Workspace',
    keywords: ['work', 'desk', 'business'],
    icon: IconDeviceLaptop,
  },
  {
    name: 'IconDeviceTablet',
    label: 'Tablet Access',
    keywords: ['device', 'screen', 'digital'],
    icon: IconDeviceTablet,
  },
  {
    name: 'IconDeviceMobile',
    label: 'Mobile Friendly',
    keywords: ['phone', 'digital', 'app'],
    icon: IconDeviceMobile,
  },
  {
    name: 'IconRouter',
    label: 'Strong Network',
    keywords: ['internet', 'router', 'wifi'],
    icon: IconRouter,
  },
  {
    name: 'IconPhoneCalling',
    label: 'Call Service',
    keywords: ['phone', 'contact', 'support'],
    icon: IconPhoneCalling,
  },
  {
    name: 'IconBrandWhatsapp',
    label: 'WhatsApp Support',
    keywords: ['chat', 'support', 'message'],
    icon: IconBrandWhatsapp,
  },
  {
    name: 'IconBrandTelegram',
    label: 'Telegram Support',
    keywords: ['chat', 'support', 'message'],
    icon: IconBrandTelegram,
  },
  {
    name: 'IconBrandInstagram',
    label: 'Instagram',
    keywords: ['social', 'media', 'photo'],
    icon: IconBrandInstagram,
  },
  {
    name: 'IconTicket',
    label: 'Ticketing',
    keywords: ['entry', 'booking', 'pass'],
    icon: IconTicket,
  },
  {
    name: 'IconQrcode',
    label: 'QR Check-in',
    keywords: ['scan', 'digital', 'entry'],
    icon: IconQrcode,
  },
  {
    name: 'IconReceipt',
    label: 'Invoice',
    keywords: ['bill', 'payment', 'receipt'],
    icon: IconReceipt,
  },
  {
    name: 'IconShoppingBag',
    label: 'Gift Shop',
    keywords: ['shop', 'store', 'souvenir'],
    icon: IconShoppingBag,
  },
  {
    name: 'IconGift',
    label: 'Welcome Gift',
    keywords: ['present', 'gift', 'bonus'],
    icon: IconGift,
  },
  {
    name: 'IconPalette',
    label: 'Art Space',
    keywords: ['creative', 'art', 'studio'],
    icon: IconPalette,
  },
  {
    name: 'IconMusic',
    label: 'Live Music',
    keywords: ['entertainment', 'audio', 'event'],
    icon: IconMusic,
  },
  {
    name: 'IconMovie',
    label: 'Cinema',
    keywords: ['movie', 'entertainment', 'screen'],
    icon: IconMovie,
  },
  {
    name: 'IconMicrophone',
    label: 'Karaoke',
    keywords: ['singing', 'audio', 'event'],
    icon: IconMicrophone,
  },
  {
    name: 'IconMapSearch',
    label: 'Nearby Attractions',
    keywords: ['map', 'discover', 'attraction'],
    icon: IconMapSearch,
  },
  {
    name: 'IconUsersGroup',
    label: 'Group Friendly',
    keywords: ['team', 'group', 'family'],
    icon: IconUsersGroup,
  },
];

const amenityIconMap = amenityIconOptions.reduce<
  Record<string, AmenityIconComponent>
>((acc, option) => {
  acc[option.name] = option.icon;

  return acc;
}, {});

export const AmenityIcon = ({
  name,
  ...props
}: ComponentPropsWithoutRef<typeof IconBrandTabler> & {
  name?: string | null;
}) => {
  const Icon = name ? amenityIconMap[name] : undefined;

  if (Icon) {
    return <Icon {...props} />;
  }

  if (name) {
    return <IconComponent name={name} {...props} />;
  }

  return <IconBrandTabler {...props} />;
};

export const AmenityIconPicker = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof Combobox.TriggerBase> & {
    value?: string;
    onValueChange?: (value: string | null) => void;
  }
>(({ value, onValueChange, className, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        variant="ghost"
        size="icon"
        ref={ref}
        className={cn('px-2', className)}
        {...props}
      >
        <AmenityIcon name={selectedValue} size={18} />
      </Combobox.TriggerBase>

      <Combobox.Content className="w-72 min-w-72">
        <Command>
          <Command.Input placeholder="Search amenity icon..." />
          <Command.Empty>No amenity icons found.</Command.Empty>
          <Command.List className="max-h-[260px] overflow-y-auto">
            <Command.Item
              value="none clear remove"
              onSelect={() => {
                setSelectedValue('');
                onValueChange?.(null);
                setOpen(false);
              }}
              className="gap-2"
            >
              <IconBrandTabler size={18} />
              <span>No icon</span>
            </Command.Item>
            {amenityIconOptions.map(({ name, label, keywords }) => (
              <Command.Item
                key={name}
                value={[name, label, ...keywords].join(' ')}
                onSelect={() => {
                  setSelectedValue(name);
                  onValueChange?.(name);
                  setOpen(false);
                }}
                className={cn(
                  'gap-2',
                  selectedValue === name && 'text-primary',
                )}
              >
                <AmenityIcon name={name} size={18} />
                <span>{label}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
});

AmenityIconPicker.displayName = 'AmenityIconPicker';
