interface CalendarEvent {
  title: string;
  start: string; // ISO String
  end: string; // ISO String
  location: string;
  description: string;
}

import { formatForICS } from "./dateUtils";

export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append(
    "dates",
    `${formatForICS(event.start)}/${formatForICS(event.end)}`
  );
  url.searchParams.append("details", event.description);
  url.searchParams.append("location", event.location);

  return url.toString();
};

export const generateOutlookUrl = (
  event: CalendarEvent,
  type: "live" | "office"
): string => {
  const baseUrl =
    type === "live"
      ? "https://outlook.live.com/calendar/0/deeplink/compose"
      : "https://outlook.office.com/calendar/0/deeplink/compose";

  const url = new URL(baseUrl);
  url.searchParams.append("path", "/calendar/action/compose");
  url.searchParams.append("rru", "addevent");
  url.searchParams.append("startdt", event.start);
  url.searchParams.append("enddt", event.end);
  url.searchParams.append("subject", event.title);
  url.searchParams.append("body", event.description);
  url.searchParams.append("location", event.location);

  return url.toString();
};
