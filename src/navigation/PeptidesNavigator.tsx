import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import { PeptidesStackParamList } from '../types';
import PeptidesHomeScreen from '../screens/peptides/PeptidesHomeScreen';
import PeptideFormScreen from '../screens/peptides/PeptideFormScreen';
import AjustesScreen from '../screens/peptides/AjustesScreen';

const Stack = createNativeStackNavigator<PeptidesStackParamList>();

export const PeptidesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="PeptidesHome" component={PeptidesHomeScreen} />
      <Stack.Screen
        name="PeptideForm"
        component={PeptideFormScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="PeptideAjustes"
        component={AjustesScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};
