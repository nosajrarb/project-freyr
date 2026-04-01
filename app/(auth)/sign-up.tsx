import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// ─── Design Tokens (logo-matched) ───────────────────────────────────────────

const C = {
  bg: "#141414", // near-black background
  surface: "#1E1E1E", // slightly lifted surface
  border: "#2A2A2A", // subtle border
  dotDim: "#4A4A4A", // grey dots
  dotFocus: "#F5F0E8", // cream accent (the glowing centre dot)
  textPrimary: "#F5F0E8", // cream for headings
  textMuted: "#888888", // muted body text
  textPlaceholder: "#3E3E3E",
  error: "#E05C5C",
};

// ─── Dot Grid Decoration ─────────────────────────────────────────────────────
function DotGrid({ highlight = 4 }: { highlight?: number }) {
  return (
    <View style={dg.grid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={[dg.dot, i === highlight && dg.dotHighlight]} />
      ))}
    </View>
  );
}

const dg = StyleSheet.create({
  grid: {
    width: 64,
    height: 64,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "center",
    marginBottom: 32,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.dotDim,
  },
  dotHighlight: {
    backgroundColor: C.dotFocus,
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) return null;

  // ── Verify Screen ────────────────────────────────────────────────────────
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={styles.container}>
        <DotGrid highlight={4} />

        <Text style={styles.title}>Verify account</Text>
        <Text style={styles.subtitle}>Enter the code sent to your email</Text>

        <TextInput
          style={styles.input}
          value={code}
          placeholder="000000"
          placeholderTextColor={C.textPlaceholder}
          onChangeText={setCode}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.ghostButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={styles.ghostButtonText}>Resend code</Text>
        </Pressable>
      </View>
    );
  }

  // ── Sign-Up Screen ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <DotGrid highlight={4} />

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="you@example.com"
          placeholderTextColor={C.textPlaceholder}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholder="••••••••"
          placeholderTextColor={C.textPlaceholder}
          secureTextEntry
          onChangeText={setPassword}
        />
        {errors.fields.password && (
          <Text style={styles.error}>{errors.fields.password.message}</Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || fetchStatus === "fetching") &&
            styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Text style={styles.linkLabel}>Already have an account? </Text>
        <Link href="/sign-in">
          <Text style={styles.linkAccent}>Sign in</Text>
        </Link>
      </View>

      <View nativeID="clerk-captcha" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    marginTop: -8,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.textPrimary,
  },
  button: {
    backgroundColor: C.dotFocus,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    color: C.bg,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostButtonText: {
    color: C.dotFocus,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 2,
  },
  linkLabel: {
    color: C.textMuted,
    fontSize: 13,
  },
  linkAccent: {
    color: C.dotFocus,
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: C.error,
    fontSize: 12,
    marginTop: -4,
  },
});
