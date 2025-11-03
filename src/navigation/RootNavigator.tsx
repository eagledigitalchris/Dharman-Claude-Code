import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import { BottomTabNavigator } from './BottomTabNavigator';
import WeightDetailScreen from '../screens/progress/WeightDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WeightDetail"
          component={WeightDetailScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
