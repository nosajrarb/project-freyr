import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Design Tokens — INVERTED palette ────────────────────────────────────────
// Sign-up: dark bg  + cream accent
// Sign-in: cream bg + dark accent  (same colors, flipped roles)

const C = {
  bg: "#F5F0E8", // cream — was the accent, now the background
  surface: "#EDE8DF", // slightly darker cream for inputs
  border: "#D8D2C8", // warm grey border
  borderFocus: "#14141466",

  dotDim: "#B8B2A8", // muted warm dots
  dotFocus: "#141414", // dark centre dot
  textPrimary: "#141414", // near-black text
  textMuted: "#888070", // warm muted
  textPlaceholder: "#C0BAB0",
  error: "#C0392B",
};
// ─── Dot Grid ─────────────────────────────────────────────────────────────────
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
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [codeFocused, setCodeFocused] = React.useState(false);

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    }
  };

  // ── MFA / Verify Screen ───────────────────────────────────────────────────
  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <DotGrid highlight={4} />

              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                Code sent to{" "}
                <Text style={styles.emailHighlight}>{emailAddress}</Text>
              </Text>

              <View style={styles.fieldGroup}>
                <TextInput
                  style={[
                    styles.input,
                    styles.codeInput,
                    codeFocused && styles.inputFocused,
                  ]}
                  value={code}
                  placeholder="000000"
                  placeholderTextColor={C.textPlaceholder}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                />
                {errors.fields.code && (
                  <Text style={styles.error}>{errors.fields.code.message}</Text>
                )}
              </View>

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

              <View style={styles.secondaryActions}>
                <Pressable onPress={() => signIn.mfa.sendEmailCode()}>
                  <Text style={styles.ghostButtonText}>Resend code</Text>
                </Pressable>
                <Text style={styles.dotSep}>·</Text>
                <Pressable onPress={() => signIn.reset()}>
                  <Text style={styles.ghostButtonText}>Start over</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Sign-In Screen ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <DotGrid highlight={4} />

            <Text style={styles.title}>Sked</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="you@example.com"
                placeholderTextColor={C.textPlaceholder}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              {errors.fields.identifier && (
                <Text style={styles.error}>
                  {errors.fields.identifier.message}
                </Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <Link href={"/forgot-password" as Href}>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </Link>
              </View>
              <TextInput
                style={[styles.input, passwordFocused && styles.inputFocused]}
                value={password}
                placeholder="••••••••"
                placeholderTextColor={C.textPlaceholder}
                secureTextEntry
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              {errors.fields.password && (
                <Text style={styles.error}>
                  {errors.fields.password.message}
                </Text>
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
              disabled={
                !emailAddress || !password || fetchStatus === "fetching"
              }
            >
              <Text style={styles.buttonText}>
                {fetchStatus === "fetching" ? "Signing in…" : "Sign in"}
              </Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Don't have an account?</Text>
              <Link href="/sign-up">
                <Text style={styles.linkAccent}> Sign up</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg, // ← fixes the white band at bottom
  },
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 52,
    paddingBottom: 48,
    gap: 16,
  },

  // Header
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    marginTop: -8,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  emailHighlight: {
    color: C.textPrimary,
    fontWeight: "600",
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  forgotLink: {
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
  codeInput: {
    letterSpacing: 10,
    textAlign: "center",
    fontSize: 22,
  },
  inputFocused: {
    borderColor: C.borderFocus,
    backgroundColor: "#E8E2D8",
  },

  // Button — dark on cream
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

  // Ghost
  ghostButtonText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  dotSep: {
    color: C.dotDim,
    fontSize: 16,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 11,
    color: C.dotDim,
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Footer
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  linkLabel: {
    color: C.textMuted,
    fontSize: 13,
  },
  linkAccent: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },

  // Error
  error: {
    color: C.error,
    fontSize: 12,
    marginTop: -4,
  },
});
