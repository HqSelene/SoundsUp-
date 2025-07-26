import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COSMIC_THEME } from '../constants/theme';

// Import screens (we'll create these later)
import HomeScreen from '../screens/home/HomeScreen';
import TicketScreen from '../screens/ticket/TicketScreen';
import CollectionScreen from '../screens/collection/CollectionScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  TicketDetail: { ticketId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Tickets: undefined;
  Collection: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'planet' : 'planet-outline';
              break;
            case 'Tickets':
              iconName = focused ? 'ticket' : 'ticket-outline';
              break;
            case 'Collection':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COSMIC_THEME.colors.accent,
        tabBarInactiveTintColor: COSMIC_THEME.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: COSMIC_THEME.colors.primary,
          borderTopColor: COSMIC_THEME.colors.secondary,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: COSMIC_THEME.colors.primary,
        },
        headerTintColor: COSMIC_THEME.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'SoundsUp' }}
      />
      <Tab.Screen 
        name="Tickets" 
        component={TicketScreen} 
        options={{ title: 'Tickets' }}
      />
      <Tab.Screen 
        name="Collection" 
        component={CollectionScreen} 
        options={{ title: 'Collection' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COSMIC_THEME.colors.primary,
          },
          headerTintColor: COSMIC_THEME.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TicketDetail" 
          component={TicketScreen} 
          options={{ title: 'Ticket Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;