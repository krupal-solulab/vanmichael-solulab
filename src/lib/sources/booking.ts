import "server-only";
import { safeFetchText } from "../safe-fetch";
import { parseBookingHtml, type BookingFacts } from "./booking-parse";

export type { BookingFacts } from "./booking-parse";
export { platformOf } from "./booking-parse";

export async function readBookingPage(url: string): Promise<BookingFacts> {
  const res = await safeFetchText(url);
  if (res.status >= 400) throw new Error(`Booking page returned HTTP ${res.status}.`);
  return parseBookingHtml(res.body, res.url);
}
