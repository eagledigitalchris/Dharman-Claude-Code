import { pt_BR } from '../constants/translations';

export const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (date: Date): string => {
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${pt_BR.months.short[monthIndex]}. ${year}`;
};

export const formatShortDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'Hoje';
  }

  const day = date.getDate();
  const monthIndex = date.getMonth();

  return `${day} ${pt_BR.months.short[monthIndex]}.`;
};

export const formatWeight = (weight: number): string => {
  return `${formatNumber(weight, 1)} kg`;
};

export const formatPercentage = (value: number): string => {
  return `${formatNumber(value, 1)} %`;
};

export const formatMeasure = (value: number, unit: string): string => {
  return `${formatNumber(value, 0)} ${unit}`;
};

export const formatMacros = (protein: number, carbs: number, fat: number): string => {
  return `${pt_BR.home.protein} ${formatNumber(protein, 0)}g · ${pt_BR.home.carbs} ${formatNumber(carbs, 0)}g · ${pt_BR.home.fat} ${formatNumber(fat, 0)}g`;
};

export const formatCalories = (current: number, goal: number): string => {
  return `${formatNumber(current, 0)} / ${formatNumber(goal, 0)} ${pt_BR.home.calories}`;
};

export const formatWater = (current: number, goal: number): string => {
  return `${formatNumber(current, 0)} / ${formatNumber(goal, 0)} ml`;
};

export const formatSteps = (current: number, goal: number): string => {
  return `${formatNumber(current, 0)} / ${formatNumber(goal, 0)}`;
};
