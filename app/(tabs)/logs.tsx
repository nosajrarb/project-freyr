import { colors } from "@/constants/colors";
import { Show, useClerk, useUser } from "@clerk/expo";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
const Logs = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  return (
    <SafeAreaProvider style={styles.main}>
      <Show when="signed-in">
        {/* <Text>Hello {user?.emailAddresses[0].emailAddress}</Text> */}
        <Pressable style={styles.button} onPress={() => signOut()}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </Show>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 16,
    backgroundColor: colors.primary_background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Logs;
