export interface WeightProgress {
  lost: number;
  total: number;
  percentage: number;
  remaining: number;
}

export const calculateWeightProgress = (
  current: number,
  initial: number,
  goal: number
): WeightProgress => {
  const totalToLose = initial - goal;
  const lostSoFar = initial - current;
  const remaining = current - goal;

  return {
    lost: lostSoFar,
    total: totalToLose,
    percentage: totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0,
    remaining,
  };
};

export const calculateBodyFat = (
  gender: 'male' | 'female',
  waist: number,
  neck: number,
  height: number,
  hips?: number
): number => {
  if (gender === 'male') {
    // Men: 495/(1.0324-0.19077*log10(waist-neck)+0.15456*log10(height))-450
    return (
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450
    );
  } else {
    // Women: 495/(1.29579-0.35004*log10(waist+hips-neck)+0.22100*log10(height))-450
    if (!hips) {
      throw new Error('Hips measurement required for female body fat calculation');
    }
    return (
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hips - neck) +
          0.221 * Math.log10(height)) -
      450
    );
  }
};

export const calculateProgressPercentage = (current: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

export const calculateCaloriesFromMacros = (
  protein: number,
  carbs: number,
  fat: number
): number => {
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  return protein * 4 + carbs * 4 + fat * 9;
};
