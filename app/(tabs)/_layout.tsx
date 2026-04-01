//TABS layout
import { colors } from "@/constants/colors";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary_background,
        }}
      >
        <ActivityIndicator size="large" color={colors.white_contrast} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary_background,
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
        },
        tabBarActiveTintColor: colors.white_contrast,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="caret-up-sharp" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
