import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SignIn from './Screens/SignIn';
import SignUp from './Screens/SignUp';
import SearchScreen from './Screens/RenterScreens/SearchScreen';
import ReservationScreen from './Screens/RenterScreens/ReservationScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from './FirebaseConfig';
import { signOut } from 'firebase/auth';
import BookVehicle from './Screens/RenterScreens/BookVehicle';
import ReservationDetailScreen from './Screens/RenterScreens/ReservationDetailScreen';
import ManageBookings from './Screens/OwnerScreens/ManageBookings';
import CreateListing from './Screens/OwnerScreens/CreateListing';
import BookingDetails from './Screens/OwnerScreens/BookingDetails';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Color palette
const colors = {
  primary: '#4A90E2',
  secondary: '#F5A623',
  background: '#F8F8F8',
  text: '#333333',
  lightText: '#FFFFFF',
  tabInactive: '#BDBDBD',
};

export default function App() {
  const btnLogoutPressed = async ({ navigation }) => {
    try {
      await signOut(auth);
      if (navigation.canGoBack()) {
        navigation.dispatch(StackActions.popToTop());
      }
    } catch (err) {
      console.log('Error signing out:', err);
    }
  };

  const btnDisplayLogout = ({ navigation }) => (
    <Pressable onPress={() => btnLogoutPressed({ navigation })} style={styles.logoutButton}>
      <Icon name='exit' size={35} color={colors.lightText} />
    </Pressable>
  );

  const RenterHomeScreen = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = route.name === 'Map' ? (focused ? 'map' : 'map-outline') : (focused ? 'ticket' : 'ticket-outline');
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Reservation" component={BookingScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );

  const OwnerHomeScreen = () => (
    <Stack.Navigator initialRouteName="Manage Booking" screenOptions={screenOptions} >
      <Stack.Screen
        name="Manage Booking"
        component={ManageBookings}
        options={({ navigation }) => ({
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 10 }}>

              <Pressable onPress={() => { navigation.navigate('Create Listing') }} style={{ marginRight: 20 }}>
                <Icon name='add' size={35} color='white' />
              </Pressable>

              {btnDisplayLogout({ navigation })}
            </View>
          )
        })} />

      <Stack.Screen
        name="Create Listing"
        component={CreateListing}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })} />

      <Stack.Screen
        name="Booking Details"
        component={BookingDetails}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })} />
    </Stack.Navigator >
  );

  const MapScreen = () => (
    <Stack.Navigator initialRouteName="Search Screen" screenOptions={screenOptions}>
      <Stack.Screen
        name="Search Screen"
        component={SearchScreen}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })}
      />
      <Stack.Screen
        name="Booking Screen"
        component={BookVehicle}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })}
      />
    </Stack.Navigator>
  );

  const BookingScreen = () => (
    <Stack.Navigator initialRouteName="Reservation Screen" screenOptions={screenOptions}>
      <Stack.Screen
        name="Reservation Screen"
        component={ReservationScreen}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })}
      />
      <Stack.Screen
        name="Reservation Detail Screen"
        component={ReservationDetailScreen}
        options={({ navigation }) => ({
          headerRight: () => btnDisplayLogout({ navigation }),
        })}
      />
    </Stack.Navigator>
  );

  const screenOptions = {
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    headerBackTitleStyle: styles.headerBackTitle,
    headerTintColor: colors.lightText,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={screenOptions}>
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Renter Home" component={RenterHomeScreen} options={{ headerShown: false, headerBackVisible: false }} />
        <Stack.Screen name="Owner Home" component={OwnerHomeScreen} options={{ headerShown: false, headerBackVisible: false }} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.primary,
  },
  headerTitle: {
    color: colors.lightText,
    fontWeight: 'bold',
  },
  headerBackTitle: {
    color: colors.lightText,
  },
  logoutButton: {
    marginRight: 15,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.tabInactive,
    paddingTop: 5,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});