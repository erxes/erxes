import { TmsCreateSheet } from '@/tms/components/CreateTmsSheet';

export const EmptyList = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-3 p-4 bg-white rounded-lg shadow-lg">
        <div className="w-full overflow-hidden h-52">
          <img
            src="https://s3-alpha-sig.figma.com/img/4849/e3fd/99aa90f4923e745b2872c6bcf76fa0fc?Expires=1745193600&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=bnQjGXfgtdp015SUmh3JGzw5lh7NzALjcWgvEIKOUUno43G5wbODw8sbSAVc4xpddCrGTwPSt96kbzTxMm5QUDBgj9gD12wirPrCHoq6Ff26ita9VxBvp08N6EmRCovQib1UZlC~ip-ugW5oH~zHtht42iw8tgRRjDyJB0bnUWgxqVwaHxP4m2j0a630~IecH~tr1NyAfWR0X9kzDAwxDCdkzootqegfhP5lB1CqhOtVzMKZ~oj-19i5~N81gc4Mnp406DGUMo3nAOAZZuA5V3TxpPDcIY8ZubpnbWS-fJNniCLR1UAN2YC8jK~QfFNZ-KHbgahNJSadcrnBuz2-wA__"
            alt="tourism"
            className="object-cover w-full h-full rounded"
          />
        </div>

        <div className="p-2 text-center">
          <h2 className="mb-3 text-xl font-semibold text-black">
            Tour management system
          </h2>

          <p className="text-center text-[#A1A1AA] text-sm font-medium leading-[140%] font-inter pb-4">
            A tour management system is software designed to organize and manage
            tourism-related activities. It helps streamline trip planning,
            booking, payment management, customer information, and travel
            schedules.
          </p>

          <TmsCreateSheet />
        </div>
      </div>
    </div>
  );
};
