const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

export const formatShortDate = (date: Date) => shortDateFormatter.format(date);
