/**
 * Translation Rules & Context Engine for Syii-Fried Engloid
 * Handles contextual resolution for 'soid', 'sooweh', suffixes (-oid, -istan, -age, -goose, -sploot),
 * and phonological/written variations.
 */

const SyiiRules = {

  /**
   * Resolves the ambiguous word 'soid' based on surrounding lexical and grammatical context.
   */
  resolveSoid(prevWord, nextWord, fullContext) {
    const prev = (prevWord || "").toLowerCase();
    const next = (nextWord || "").toLowerCase();
    const ctx = fullContext.toLowerCase();

    // Context pattern checks
    if (prev === "a" || prev === "great" || prev === "good" || prev === "banger") {
      return { text: "song", confidence: "high" };
    }
    if (prev === "fucking" || prev === "so" || prev === "feel" || prev === "feeling") {
      return { text: "sick", confidence: "high" };
    }
    if (prev === "civ" || prev === "number" || prev === "top") {
      return { text: "Six", confidence: "high" };
    }
    if (ctx.includes("make any soid") || (prev === "any" && (next === "" || next === "."))) {
      return { text: "sense", confidence: "high" };
    }
    if (prev === "you" || prev === "u" || prev === "yee" || prev === "to") {
      return { text: "sing", confidence: "high" };
    }
    if (prev === "i'll" || prev === "ill" || prev === "we'll" || prev === "well") {
      return { text: "see", confidence: "high" };
    }
    if (prev === "omar" || prev === "mr" || prev === "mister") {
      return { text: "Singh", confidence: "high" };
    }
    if (prev === "sex" || prev === "movie" || prev === "opening") {
      return { text: "scene", confidence: "high" };
    }

    // Default fallback if ambiguous
    return { text: "soid", confidence: "uncertain", reason: "Ambiguous 'soid' context" };
  },

  /**
   * Resolves 'sooweh' either as an exclamation replacement or as a referential noun.
   */
  resolveSooweh(prevWord, nextWord, establishedNouns) {
    const prev = (prevWord || "").toLowerCase();
    
    // Swear / exclamation replacement check
    if (prev === "the" || prev === "what") {
      return { text: "hell", confidence: "medium" };
    }

    // Referential noun resolution
    if (establishedNouns && establishedNouns.length > 0) {
      // Pick the most recent relevant established noun
      const targetNoun = establishedNouns[establishedNouns.length - 1];
      return { text: targetNoun, confidence: "medium" };
    }

    return { text: "sooweh", confidence: "uncertain", reason: "Unresolved 'sooweh' reference" };
  },

  /**
   * Handles sentence-ending '-istan' suffix.
   */
  processIstanSuffix(word) {
    const cleanWord = word.replace(/[.,!?]$/, "");
    const punctuation = word.slice(cleanWord.length);

    if (cleanWord.toLowerCase().endsWith("istan") && cleanWord.length > 6) {
      // Exclude common standard English words ending in -istan
      const lower = cleanWord.toLowerCase();
      const standardIstans = ["pakistan", "afghanistan", "uzbekistan", "kazakhstan", "turkmenistan", "kyrgyzstan", "tajikistan"];
      if (!standardIstans.includes(lower)) {
        const base = cleanWord.slice(0, -5);
        return {
          transformed: true,
          text: base,
          punctuation: punctuation || "."
        };
      }
    }
    return { transformed: false, text: word, punctuation: "" };
  },

  /**
   * Handles versatile '-oid' suffix transformations (-ing, -ly, on/out).
   */
  processOidSuffix(word, nextWord) {
    const lower = word.toLowerCase();

    // Standalone "oid" following verb (e.g. "hop oid" -> "hop on", "get oid" -> "get out")
    if (lower === "oid") {
      return { transformed: true, text: "out / on", confidence: "medium" };
    }

    if (lower.endsWith("oid") && lower.length > 4) {
      const stem = word.slice(0, -3);

      // Rule A: Adverbial check (-ly -> -oid) e.g., realloid -> really, bubbloid -> bubbly
      if (stem.endsWith("l") || stem.endsWith("real") || stem.endsWith("bubbl")) {
        // Fix trailing double 'l' if needed
        const lyForm = stem.endsWith("l") ? stem + "y" : stem + "ly";
        return { transformed: true, text: lyForm, confidence: "high" };
      }

      // Rule B: Verb participle (-ing -> -oid) e.g., talkoid -> talking, thinkoid -> thinking
      if (stem.endsWith("e")) {
        return { transformed: true, text: stem.slice(0, -1) + "ing", confidence: "high" };
      }
      return { transformed: true, text: stem + "ing", confidence: "high" };
    }

    return { transformed: false, text: word };
  },

  /**
   * Handles morphology: -age, -goose, -sploot, rolled R patterns, and written phonology.
   */
  processMorphology(word) {
    let clean = word;
    let trailingPunct = "";

    // Extract trailing punctuation
    const matchPunct = word.match(/([.,!?]+)$/);
    if (matchPunct) {
      trailingPunct = matchPunct[1];
      clean = word.slice(0, -trailingPunct.length);
    }

    const lower = clean.toLowerCase();

    // Suffix: -age (e.g., tuffage -> tuff)
    if (lower.endsWith("age") && lower.length > 5 && !["garage", "savage", "damage", "manage", "villag"].some(w => lower.includes(w))) {
      return { text: clean.slice(0, -3) + trailingPunct, confidence: "medium" };
    }

    // Suffix: -goose (e.g., jeezgoose -> Jesus, agoose -> anus handled in dict, general -goose removal)
    if (lower.endsWith("goose") && lower.length > 6 && lower !== "mongoose") {
      const stem = clean.slice(0, -5);
      return { text: stem + trailingPunct, confidence: "medium" };
    }

    // Suffix: -sploot (playful modifier, keep base word or mark soft)
    if (lower.endsWith("sploot") && lower.length > 7) {
      const stem = clean.slice(0, -6);
      return { text: stem + trailingPunct, confidence: "high" };
    }

    // Rolled R trailing / written representation (e.g., whatrrr -> what)
    if (/[a-zA-Z]rrr+$/.test(clean)) {
      const trimmed = clean.replace(/rrr+$/i, "");
      return { text: trimmed + trailingPunct, confidence: "high" };
    }

    // Unstressed final written 'ay' / 'ae' (e.g., ideay -> idea, populae -> popular)
    if (lower.endsWith("ideay")) {
      return { text: clean.slice(0, -1) + trailingPunct, confidence: "high" };
    }
    if (lower.endsWith("populae")) {
      return { text: clean.slice(0, -2) + "ar" + trailingPunct, confidence: "high" };
    }

    return { text: word, confidence: "none" };
  }
};
