import { HeatmapConfig } from "@/types/heatmap";
import { memo, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const CELL = 13;
const GAP = 3;
const DAYS_IN_WEEK = 7;
const DAY_LABELS = ["", "M", "", "W", "", "F", ""];

// Intensity scale: warm red tones to match the app's red accent
function getIntensityColor(intensity: number | undefined): string {
  if (!intensity || intensity === 0) return "#2A2A2A"; // near palette.dark_gray
  if (intensity === 1) return "#ffffff45";
  if (intensity === 2) return "#ffffffa4";
  if (intensity === 3) return "#ffffffcc";
  return "#fcfbfb"; // palette.red — max intensity matches app accent
}

// Moved outside — stable, never changes
function resolveDate(value: string): string {
  if (value === "today") return new Date().toISOString().slice(0, 10);
  return value;
}

function buildHeatmapData(
  startDate: string,
  endDate: string,
  data: { date: string; intensity: number }[],
) {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  const dataMap = new Map(data.map((d) => [d.date, d.intensity]));

  const alignedStart = new Date(start);
  alignedStart.setDate(start.getDate() - start.getDay());

  const weeks: { date: string; inRange: boolean }[][] = [];
  const monthLabels: { label: string; colIndex: number }[] = [];
  const seenMonths = new Set<string>();
  const cursor = new Date(alignedStart);

  while (true) {
    const week: { date: string; inRange: boolean }[] = [];

    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const cellDate = new Date(iso + "T12:00:00");
      const inRange = cellDate >= start && cellDate <= end;

      const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      if (inRange && cursor.getDay() <= 1 && !seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        monthLabels.push({
          label: cursor.toLocaleString("default", { month: "short" }),
          colIndex: weeks.length,
        });
      }

      week.push({ date: iso, inRange });
      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push(week);

    if (new Date(cursor.toISOString().slice(0, 10) + "T12:00:00") > end) break;
  }

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  const activeDays = data.filter((d) => d.intensity > 0).length;

  return { weeks, monthLabels, totalDays, activeDays, dataMap };
}

const WeekColumn = memo(
  ({
    week,
    dataMap,
  }: {
    week: { date: string; inRange: boolean }[];
    dataMap: Map<string, number>;
  }) => (
    <View style={styles.weekCol}>
      {week.map(({ date, inRange }) => {
        const intensity = dataMap.get(date);
        return (
          <View
            key={date}
            style={[
              styles.cell,
              {
                backgroundColor: inRange
                  ? getIntensityColor(intensity)
                  : "transparent",
              },
            ]}
          />
        );
      })}
    </View>
  ),
);

const Heatmap = memo(({ startDate, endDate, data }: HeatmapConfig) => {
  // Resolve "today" once per render, before memo
  const resolvedEnd = useMemo(() => resolveDate(endDate), [endDate]);
  const resolvedStart = useMemo(() => resolveDate(startDate), [startDate]);

  const { weeks, monthLabels, totalDays, activeDays, dataMap } = useMemo(
    () => buildHeatmapData(resolvedStart, resolvedEnd, data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedStart, resolvedEnd, data],
  );

  const monthRowWidth = weeks.length * (CELL + GAP);

  return (
    <View style={styles.wrapper}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{activeDays}</Text>
          <Text style={styles.statLabel}>active days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalDays}</Text>
          <Text style={styles.statLabel}>total days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>consistency</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.gridWrapper}>
        {/* Day labels — outside scroll, stays pinned */}
        <View style={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <Text key={i} style={styles.dayLabelText}>
              {label}
            </Text>
          ))}
        </View>

        {/* Scrollable heatmap body */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            {/* Month labels */}
            <View style={[styles.monthRow, { width: monthRowWidth }]}>
              {monthLabels.map(({ label, colIndex }) => (
                <Text
                  key={`${label}-${colIndex}`}
                  style={[styles.monthLabel, { left: colIndex * (CELL + GAP) }]}
                >
                  {label}
                </Text>
              ))}
            </View>

            {/* Heatmap columns */}
            <View style={styles.grid}>
              {weeks.map((week, wi) => (
                <WeekColumn key={wi} week={week} dataMap={dataMap} />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[undefined, 1, 2, 3, 4].map((v, i) => (
          <View
            key={i}
            style={[styles.cell, { backgroundColor: getIntensityColor(v) }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#1E1E1E", // palette.gray
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#3E3E3E", // palette.dark_gray
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#3E3E3E", // palette.dark_gray
  },
  statBox: {
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F5F0E8", // palette.white
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: "#888888", // palette.light_gray
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#3E3E3E", // palette.dark_gray
  },
  gridWrapper: {
    flexDirection: "row",
    gap: 6,
  },
  dayLabels: {
    flexDirection: "column",
    gap: GAP,
    paddingTop: 20,
  },
  dayLabelText: {
    width: 12,
    height: CELL,
    fontSize: 9,
    color: "#888888", // palette.light_gray
    textAlign: "right",
    lineHeight: CELL,
    fontWeight: "500",
  },
  scrollContent: {
    flexDirection: "column",
  },
  monthRow: {
    position: "relative",
    height: 18,
    marginBottom: 2,
  },
  monthLabel: {
    position: "absolute",
    fontSize: 10,
    color: "#888888", // palette.light_gray
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    gap: GAP,
  },
  weekCol: {
    flexDirection: "column",
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 3,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#888888", // palette.light_gray
    fontWeight: "500",
    marginHorizontal: 2,
  },
});

export default Heatmap;
