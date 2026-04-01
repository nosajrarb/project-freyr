import { colors } from "@/constants/colors";
import { useClerk, useUser } from "@clerk/expo";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Page() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <>
      <SafeAreaView style={styles.main}>
        <Text>dsklfj</Text>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.primary_background,
    padding: 20,
    paddingTop: 60,
  },
});
