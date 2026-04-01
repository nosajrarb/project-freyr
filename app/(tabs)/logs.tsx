import { colors } from "@/constants/colors";
// import { useUser } from "@clerk/expo";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
const Logs = () => {
  // const { user } = useUser();
  return <SafeAreaProvider style={styles.main}></SafeAreaProvider>;
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
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
