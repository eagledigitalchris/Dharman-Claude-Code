import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { pt_BR } from '../constants/translations';
import { MainTabParamList } from '../types';

// Import screens (we'll create these next)
import HomeScreen from '../screens/home/HomeScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.progress.filled,
        tabBarInactiveTintColor: colors.text.secondary,
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: pt_BR.navigation.home,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={PlaceholderScreen}
        options={{
          title: pt_BR.navigation.explore,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={PlaceholderScreen}
        options={{
          title: pt_BR.navigation.messages,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: pt_BR.progress.title,
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
