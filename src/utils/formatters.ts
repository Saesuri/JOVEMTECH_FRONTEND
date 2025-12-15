import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

// Detect locale from browser language settings
const userLocale = navigator.language || "pt-BR";
const isBr = userLocale.toLowerCase().startsWith("pt");

// Helper to ensure Date object
const toDate = (date: string | Date) => new Date(date);

// --- FORMATTERS ---

// Display: "07/12/2023" (BR) or "12/7/2023" (US)
export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat(userLocale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(toDate(date));
};

// Display: "14:30" (BR) or "2:30 PM" (US)
export const formatTime = (date: string | Date) => {
  return new Intl.DateTimeFormat(userLocale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !isBr,
  }).format(toDate(date));
};

// Display: "07/12/2023 14:30"
export const formatDateTime = (date: string | Date) => {
  return new Intl.DateTimeFormat(userLocale, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: !isBr,
  }).format(toDate(date));
};

// Display: "14:00 – 15:00"
export const formatTimeRange = (start: string | Date, end: string | Date) => {
  const s = toDate(start);
  const e = toDate(end);

  const fmt = new Intl.DateTimeFormat(userLocale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !isBr,
  }) as Intl.DateTimeFormat & {
    formatRange?: (start: Date, end: Date) => string;
  };

  if (typeof fmt.formatRange === "function") {
    return fmt.formatRange(s, e);
  }

  return `${fmt.format(s)} – ${fmt.format(e)}`;
};

// Display: "seg., 7 de dez." (BR) or "Mon, Dec 7" (US)
export const formatFriendlyDate = (date: string | Date) => {
  return new Intl.DateTimeFormat(userLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(toDate(date));
};

// Display: "seg." (BR) or "Mon" (US)
export const formatWeekday = (date: string | Date) => {
  return new Intl.DateTimeFormat(userLocale, {
    weekday: "short",
  }).format(toDate(date));
};

// Relative: "há 5 minutos" (BR) vs "5 minutes ago" (US)
export const formatRelativeTime = (date: string | Date) => {
  return formatDistanceToNow(toDate(date), {
    addSuffix: true,
    locale: isBr ? ptBR : enUS,
  });
};
