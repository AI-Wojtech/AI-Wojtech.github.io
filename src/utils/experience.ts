const EXPERIENCE_START_DATE = new Date(Date.UTC(2018, 4, 1));

export const getFullYearsSince = (startDate: Date) => {
  const now = new Date();
  const yearDiff = now.getUTCFullYear() - startDate.getUTCFullYear();
  const anniversary = new Date(Date.UTC(now.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  return now >= anniversary ? yearDiff : Math.max(0, yearDiff - 1);
};

export const getYearsExperience = () => getFullYearsSince(EXPERIENCE_START_DATE);
