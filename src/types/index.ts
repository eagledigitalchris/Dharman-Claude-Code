export interface User {
  id: string;
  name: string;
  email: string;
  height_cm: number;
  gender: 'male' | 'female';
  goal_weight_kg: number;
  goal_water_ml: number;
  goal_steps: number;
  goal_calories: number;
  created_at: Date;
}

export interface Weight {
  id: string;
  user_id: string;
  date: Date;
  weight_kg: number;
  created_at: Date;
}

export interface HydrationLog {
  id: string;
  user_id: string;
  date: Date;
  ml: number;
  logged_at: Date;
}

export interface Steps {
  id: string;
  user_id: string;
  date: Date;
  steps: number;
  updated_at: Date;
}

export interface Checkin {
  id: string;
  user_id: string;
  week_ref: string;
  photos: {
    front: string;
    side: string;
    back: string;
  };
  weight_kg: number;
  waist_cm: number;
  body_fat_pct: number;
  created_at: Date;
}

export interface Measure {
  id: string;
  user_id: string;
  date: Date;
  neck_cm?: number;
  waist_cm: number;
  hips_cm?: number;
  body_fat_pct: number;
  created_at: Date;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  time: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealCheck {
  id: string;
  user_id: string;
  date: Date;
  template_id: string;
  checked: boolean;
  logged_at: Date;
}

export interface TrainingSplit {
  id: string;
  user_id: string;
  day_of_week: number;
  muscle_groups: string[];
}

export type RootStackParamList = {
  MainTabs: undefined;
  WeightDetail: undefined;
  CheckinCamera: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Messages: undefined;
  Progress: undefined;
};
