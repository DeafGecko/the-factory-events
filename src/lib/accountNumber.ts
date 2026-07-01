// src/lib/accountNumber.ts
// Account number format: YY + 4-digit sequence
// e.g. 260001, 260002, 270001 (resets each year)
// Applies to: bookings, tenants, clients, vendors, spaces

import { sanityClient } from './sanity';

const QUERIES = [
  `*[_type == "booking"   && defined(accountNumber) && accountNumber match $prefix + "*"] | order(accountNumber desc)[0].accountNumber`,
  `*[_type == "tenant"    && defined(accountNumber) && accountNumber match $prefix + "*"] | order(accountNumber desc)[0].accountNumber`,
  `*[_type == "client"    && defined(accountNumber) && accountNumber match $prefix + "*"] | order(accountNumber desc)[0].accountNumber`,
  `*[_type == "vendor"    && defined(accountNumber) && accountNumber match $prefix + "*"] | order(accountNumber desc)[0].accountNumber`,
];

export async function generateAccountNumber(): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(-2); // "26"
  const prefix = yy;

  // Find the highest account number across all entity types this year
  const results = await Promise.all(
    QUERIES.map(q => sanityClient.fetch<string | null>(q, { prefix }).catch(() => null))
  );

  let maxSeq = 0;
  for (const acc of results) {
    if (!acc) continue;
    const match = acc.match(/^\d{2}(\d{4})$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  }

  const next = String(maxSeq + 1).padStart(4, '0');
  return `${yy}${next}`;
}
