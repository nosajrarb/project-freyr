//TABS layout
import { colors } from "@/constants/colors";
import { Show, useAuth, useClerk } from "@clerk/expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
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
        tabBarShowLabel: false,
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
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerRight: () => (
            <View style={{ flexDirection: "row", marginRight: 15, gap: 25 }}>
              <Pressable>
                <Ionicons
                  name="settings-sharp"
                  size={24}
                  color={colors.white_contrast}
                />
              </Pressable>
              <Show when="signed-in">
                <Pressable onPress={() => signOut()}>
                  <MaterialCommunityIcons
                    name="logout"
                    size={24}
                    color={colors.white_contrast}
                  ></MaterialCommunityIcons>
                </Pressable>
              </Show>
            </View>
          ), // make header sit right over the other content
          title: "Logs",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
