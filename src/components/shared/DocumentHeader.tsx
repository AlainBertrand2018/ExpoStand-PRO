import { COMPANY_DETAILS, APP_NAME } from '@/lib/constants';
import Image from 'next/image';

export function DocumentHeader() {
  return (
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           {/* Using an inline SVG for the logo as per guidelines on non-textual code */}
          <div className="flex items-center gap-3 mb-2">
             <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
              aria-label="ExpoStand Pro Logo"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h2 className="text-2xl font-bold text-primary font-headline">{APP_NAME}</h2>
          </div>
          <p className="font-semibold text-lg">{COMPANY_DETAILS.name}</p>
          <p className="text-sm text-muted-foreground">BRN: {COMPANY_DETAILS.brn} • VAT: {COMPANY_DETAILS.vat}</p>
        </div>
        <div className="text-sm text-right">
          <p>{COMPANY_DETAILS.address}</p>
          <p>Tel: {COMPANY_DETAILS.tel}</p>
          <p>Email: <a href={`mailto:${COMPANY_DETAILS.email}`} className="text-primary hover:underline">{COMPANY_DETAILS.email}</a></p>
          <p>URL: <a href={`https://${COMPANY_DETAILS.url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{COMPANY_DETAILS.url}</a></p>
        </div>
      </div>
    </div>
  );
}
