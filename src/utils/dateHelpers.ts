import { pt_BR } from '../constants/translations';

export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getMonthsBetween = (startDate: Date, endDate: Date): number => {
  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  return months;
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatPeriod = (months: number): string => {
  if (months === 0) {
    return 'hoje';
  } else if (months === 1) {
    return `${pt_BR.progress.inPeriod} 1 mês`;
  } else if (months < 12) {
    return `${pt_BR.progress.inPeriod} ${months} ${pt_BR.progress.months}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${pt_BR.progress.inPeriod} ${years} ${years === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${pt_BR.progress.inPeriod} ${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${pt_BR.progress.months}`;
    }
  }
};

export const formatDaysPeriod = (days: number): string => {
  if (days === 0) {
    return 'hoje';
  } else if (days === 1) {
    return `${pt_BR.progress.inPeriod} 1 dia`;
  } else {
    return `${pt_BR.progress.inPeriod} ${days} ${pt_BR.progress.days}`;
  }
};

export const getWeekReference = (date: Date): string => {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getTodayFormatted = (): string => {
  const today = new Date();
  const day = today.getDate();
  const monthIndex = today.getMonth();

  return `Hoje, ${day} ${pt_BR.months.short[monthIndex]}`;
};
