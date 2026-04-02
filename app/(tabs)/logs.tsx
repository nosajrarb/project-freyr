import { colors } from "@/constants/colors";
// import { useUser } from "@clerk/expo";
import { ActivityData } from "@/types/heatmap";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Heatmap from "../components/heatmap";

const ad = [
  { date: "2026-03-01", intensity: 2 },
  { date: "2026-04-02", intensity: 4 },
  { date: "2026-04-14", intensity: 1 },
];
const today = new Date().toISOString().slice(0, 10);

const Logs = () => {
  // const { user } = useUser();

  const [activityData, setActivityData] = useState<ActivityData[]>(ad);
  /**fetch activity data here */

  return (
    <SafeAreaProvider style={styles.main}>
      <Heatmap
        startDate={`${new Date().getFullYear()}-01-01`}
        endDate={"2026-12-31"}
        data={activityData}
      />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 20,
    paddingTop: 110,
    gap: 16,
    backgroundColor: colors.primary_background,
  },
});

export default Logs;
