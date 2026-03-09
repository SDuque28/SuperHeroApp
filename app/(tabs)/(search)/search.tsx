import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import axios, { isAxiosError } from "axios";
import HalftoneOverlay from "@/src/components/HalftoneOverlay/HalftoneOverlay";
import HeroModal from "@/src/components/HeroModal/HeroModal";
import HeroDetailCard from "@/src/components/HeroDetailCard/HeroDetailCard";

// ─── AXIOS ───────────────────────────────────────────────────────────────────
const API_KEY = "ddc92e6ed8ef5366368a9cff47b3dd8c";
const api = axios.create({
  baseURL: `https://superheroapi.com/api/${API_KEY}`,
  timeout: 10_000,
});

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface Hero {
  id: string;
  name: string;
  image: { url: string };
  powerstats: {
    intelligence: string;
    strength: string;
    speed: string;
    durability: string;
    power: string;
    combat: string;
  };
  biography: {
    "full-name": string;
    "alter-egos": string;
    aliases: string[];
    "place-of-birth": string;
    "first-appearance": string;
    publisher: string;
    alignment: string;
  };
  appearance: {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    "eye-color": string;
    "hair-color": string;
  };
  work: { occupation: string; base: string };
  connections: { "group-affiliation": string; relatives: string };
}

interface HeroResponse extends Hero { response: string; }

// ─── HELPER ───────────────────────────────────────────────────────────────────
function isNumericId(term: string): boolean {
  const n = Number(term.trim());
  return Number.isInteger(n) && n >= 1 && n <= 731;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function SearchScreen() {
  const [query, setQuery]               = useState("");
  const [results, setResults]           = useState<Hero[]>([]);
  const [searching, setSearching]       = useState(false);
  const [searched, setSearched]         = useState(false);
  const [searchError, setSearchError]   = useState("");
  const [modalHero, setModalHero]       = useState<Hero | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const inputRef   = useRef<TextInput>(null);
  const inputScale = useSharedValue(1);
  const inputAnim  = useAnimatedStyle(() => ({ transform: [{ scale: inputScale.value }] }));

  const handleSearch = useCallback(async (overrideTerm?: string) => {
    const term = (overrideTerm ?? query).trim();
    if (!term) return;

    setSearching(true);
    setSearched(true);
    setSearchError("");
    setResults([]);
    setModalVisible(false);

    try {
      if (isNumericId(term)) {
        const { data } = await api.get<HeroResponse>(`/${term}`);
        if (data.response === "error") {
          setSearchError(`No hero found with ID "${term}".`);
        } else {
          setModalHero(data);
          setModalVisible(true);
        }
      } else {
        const { data } = await api.get<{ response: string; results: Hero[] }>(
          `/search/${encodeURIComponent(term)}`
        );
        if (data.response === "success" && data.results?.length > 0) {
          setResults(data.results);
          setModalHero(data.results[0]);
          setModalVisible(true);
        } else {
          setSearchError(`No heroes found for "${term}"`);
        }
      }
    } catch (err) {
      if (isAxiosError(err) && err.code === "ECONNABORTED") {
        setSearchError("Request timed out. Check your connection.");
      } else {
        setSearchError("Connection error. Please try again.");
      }
    } finally {
      setSearching(false);
    }
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setSearchError("");
    setModalVisible(false);
    inputRef.current?.focus();
  }, []);

  const handleViewFull = useCallback((hero: Hero) => {
    setModalVisible(false);
    router.push({
      pathname: "/heroes/[id]",
      params: { id: hero.id, heroData: JSON.stringify(hero) },
    });
  }, []);

  const isId = query.trim().length > 0 && isNumericId(query.trim());
  const searchHint = query.trim()
    ? isId
      ? `Fetching hero #${query.trim()} directly`
      : "Searching by name across 700+ characters"
    : "Search by name or ID (1–731)";

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <StatusBar barStyle="light-content" backgroundColor="#1A1028" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <LinearGradient colors={["#1A1028", "#1A0040", "#110030"]} style={styles.header}>
          <HalftoneOverlay dotColor="rgba(255,214,0,0.07)" size={10} />

          <View style={styles.titleRow}>
            <Text style={styles.title}>FIND YOUR</Text>
            <Text style={styles.titleAccent}>HERO.</Text>
          </View>

          <Text style={styles.subtitle}>{searchHint}</Text>

          <Animated.View style={[styles.searchBar, inputAnim]}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="e.g. Batman, 70, Spider-Man, 332..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={query}
              onChangeText={setQuery}
              onFocus={() => { inputScale.value = withSpring(1.01); }}
              onBlur={() => { inputScale.value = withSpring(1); }}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Mode badge */}
          {query.trim().length > 0 && (
            <View style={[styles.modeBadge, { borderColor: isId ? "#0057FF" : "#00C853" }]}>
              <Text style={[styles.modeBadgeText, { color: isId ? "#0057FF" : "#00C853" }]}>
                {isId ? "ID MODE" : "NAME MODE"}
              </Text>
            </View>
          )}

          {/* Search button */}
          <TouchableOpacity
            style={[styles.searchBtn, query.trim().length === 0 && { opacity: 0.5 }]}
            onPress={() => handleSearch()}
            disabled={query.trim().length === 0}
            activeOpacity={0.85}
          >
            <View style={styles.searchBtnShadow} />
            <View style={styles.searchBtnBody}>
              <Text style={styles.searchBtnText}>SEARCH HEROES</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── RESULTS ── */}
        {searched && (
          <View style={styles.resultsSection}>
            {searching && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="large" color="#E8173D" />
                <Text style={styles.loadingText}>SCANNING DATABASE...</Text>
              </View>
            )}

            {!searching && searchError !== "" && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🦹</Text>
                <Text style={styles.emptyTitle}>{searchError}</Text>
                <Text style={styles.emptySub}>
                  Try a different name, or an ID between 1 and 731.
                </Text>
                <TouchableOpacity onPress={clearSearch} style={styles.emptyBtn}>
                  <Text style={styles.emptyBtnText}>TRY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Show list only when there are multiple results */}
            {!searching && results.length > 1 && (
              <View>
                <View style={styles.resultsHeader}>
                  <View style={styles.labelLine} />
                  <Text style={styles.sectionLabel}>{results.length} RESULTS FOUND</Text>
                  <Text style={styles.tapHint}>TAP TO EXPAND ›</Text>
                </View>
                {results.map((hero, i) => (
                  <HeroDetailCard
                    key={hero.id}
                    hero={hero}
                    index={i}
                    onViewFull={handleViewFull}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <HeroModal
        hero={modalHero}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onViewFull={handleViewFull}
      />
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFF9EE" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 5,
    borderBottomColor: "#FFD600",
    overflow: "hidden",
  },
  titleRow: { marginBottom: 8 },
  title: {
    fontFamily: "Bangers_400Regular",
    fontSize: 44,
    letterSpacing: 3,
    color: "#fff",
    lineHeight: 44,
    textShadowColor: "#1A1028",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  titleAccent: {
    fontFamily: "Bangers_400Regular",
    fontSize: 56,
    letterSpacing: 3,
    color: "#FFD600",
    lineHeight: 56,
    textShadowColor: "#1A1028",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: "Oswald_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 3,
    borderColor: "#FFD600",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    fontFamily: "Oswald_400Regular",
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.5,
    padding: 0,
  },
  clearBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  clearBtnText: { fontFamily: "Oswald_700Bold", fontSize: 11, color: "#fff" },

  modeBadge: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  modeBadgeText: { fontFamily: "Oswald_700Bold", fontSize: 9, letterSpacing: 3 },

  searchBtn: { position: "relative" },
  searchBtnShadow: {
    position: "absolute",
    top: 5, left: 5, right: -5, bottom: -5,
    backgroundColor: "#1A1028",
    borderRadius: 4,
  },
  searchBtnBody: {
    backgroundColor: "#FFD600",
    borderWidth: 3,
    borderColor: "#1A1028",
    borderRadius: 4,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: {
    fontFamily: "Bangers_400Regular",
    fontSize: 20,
    letterSpacing: 2,
    color: "#1A1028",
  },

  resultsSection: { backgroundColor: "#FFF9EE", paddingVertical: 16 },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  tapHint: {
    fontFamily: "Oswald_700Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: "rgba(0,0,0,0.25)",
    textTransform: "uppercase",
    marginLeft: "auto",
  },
  labelLine: { width: 30, height: 3, backgroundColor: "#E8173D" },
  sectionLabel: {
    fontFamily: "Oswald_700Bold",
    fontSize: 11,
    letterSpacing: 4,
    color: "#E8173D",
    textTransform: "uppercase",
  },

  loadingRow: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: {
    fontFamily: "Bangers_400Regular",
    fontSize: 18,
    letterSpacing: 3,
    color: "#1A1028",
  },

  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontFamily: "Bangers_400Regular",
    fontSize: 20,
    letterSpacing: 2,
    color: "#1A1028",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: "Oswald_400Regular",
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: "#FFD600",
    borderWidth: 3,
    borderColor: "#1A1028",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },
  emptyBtnText: {
    fontFamily: "Bangers_400Regular",
    fontSize: 16,
    letterSpacing: 2,
    color: "#1A1028",
  },
});