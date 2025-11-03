import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_ID: '@fitness_user_id',
  USER_DATA: '@fitness_user_data',
  WATER_LOGS: '@fitness_water_logs',
  STEPS: '@fitness_steps',
};

export const StorageService = {
  // User
  async saveUserId(userId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_ID, userId);
  },

  async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.USER_ID);
  },

  async saveUserData(data: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  },

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  // Water logs cache
  async saveWaterLogs(date: string, logs: any[]): Promise<void> {
    const key = `${KEYS.WATER_LOGS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(logs));
  },

  async getWaterLogs(date: string): Promise<any[] | null> {
    const key = `${KEYS.WATER_LOGS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Steps cache
  async saveSteps(date: string, steps: number): Promise<void> {
    const key = `${KEYS.STEPS}_${date}`;
    await AsyncStorage.setItem(key, steps.toString());
  },

  async getSteps(date: string): Promise<number | null> {
    const key = `${KEYS.STEPS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? parseInt(data, 10) : null;
  },

  // Clear all
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};
