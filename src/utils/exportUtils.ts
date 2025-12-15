import { formatDate, formatTime, formatDateTime } from "./formatters";
import { formatForICS } from "./dateUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return;
  }

  const headers = [
    "Booking ID",
    "User Email",
    "Room Name",
    "Room Type",
    "Date",
    "Start Time",
    "End Time",
    "Created At",
  ];

  const rows = data.map((row) => [
    row.id,
    row.profiles?.email || "Deleted User",
    row.spaces?.name || "Unknown Room",
    row.spaces?.type || "Unknown Type",
    formatDate(row.start_time),
    formatTime(row.start_time),
    formatTime(row.end_time),
    formatDateTime(row.created_at),
  ]);

  const csvContent = [
    headers.join(","),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...rows.map((e) => e.map((val: any) => `"${val}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadICS = (event: {
  title: string;
  start: string;
  end: string;
  location: string;
  description?: string;
}) => {
  const start = formatForICS(event.start);
  const end = formatForICS(event.end);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CajuHub//Room Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@cajuhub.com`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description || "Room booking via CajuHub"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "invite.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
