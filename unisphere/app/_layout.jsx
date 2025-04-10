import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import index from './index';
import Feed from './Feed';
import Profile from './Profile';
import Marketplace from './MarketPlace';
import Notifications from './Notifications';
import Events from './Events';
import EventDetail from './EventDetail';
import Login from './Login';
import AddPost from './AddPost';

// Remove placeholder as we now have the actual component
// const AddPostScreen = () => <View style={{ flex: 1, backgroundColor: '#F3F2EF' }} />;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Context for scroll tracking
export const ScrollContext = React.createContext({
  scrollY: new Animated.Value(0),
});

// Main tabs component
const AppTabs = () => {
  const { scrollY } = React.useContext(ScrollContext);
  
  // Calculate tab bar translation based on scroll
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0, 60],
    extrapolate: 'clamp',
  });
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AddPost') {
            iconName = 'plus-circle';
            size = 40;
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'bell' : 'bell-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'store' : 'store-outline';
          }
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0A66C2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          elevation: 5,
          backgroundColor: '#FFFFFF',
          transform: [{ translateY: tabBarTranslateY }],
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Events" component={Events} />

      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Marketplace" component={Marketplace} />
    </Tab.Navigator>
  );
};

const _layout = () => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  
  return (
    <ScrollContext.Provider value={{ scrollY }}>
      <Stack.Navigator>
       <Stack.Screen name="Index" component={index} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetail" component={EventDetail} options={{ headerShown: false }} />
      </Stack.Navigator>
    </ScrollContext.Provider>
  );
};

export default _layout;