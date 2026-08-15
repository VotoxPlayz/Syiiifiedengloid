/**
 * Main Translation Engine & UI Logic
 * Coordinates multi-pass translation: Phrase detection, Noun tracking, Word rules, and UI rendering.
 */

class SyiiTranslator {
  constructor() {
    this.dictionary = SYII_DICTIONARY;
    this.rules = SyiiRules;
  }

  /**
   * Main entry point for translation.
   * Returns array of object tokens: { original, english, confidence, isUncertain, note }
   */
  translate(input) {
    if (!input || !input.trim()) {
      return [];
    }

    let text = input.trim();
    
    // Step 1: Detect and extract known multi-word phrases
    const phraseResults = this.extractPhrases(text);
    text = phraseResults.processedText;

    // Step 2: Extract candidate nouns for 'sooweh' referential tracking
    const establishedNouns = this.extractEstablishedNouns(text);

    // Step 3: Tokenize remaining text into words
    const tokens = text.split(/\s+/);
    const translatedTokens = [];

    for (let i = 0; i < tokens.length; i++) {
      const rawToken = tokens[i];

      // If token is a phrase placeholder, restore the phrase translation
      if (rawToken.startsWith("___PHRASE_")) {
        const index = parseInt(rawToken.replace("___PHRASE_", "").replace("___", ""), 10);
        translatedTokens.push(phraseResults.phrasesFound[index]);
        continue;
      }

      const prevWord = i > 0 ? tokens[i - 1] : "";
      const nextWord = i < tokens.length - 1 ? tokens[i + 1] : "";

      const translated = this.translateSingleToken(rawToken, prevWord, nextWord, text, establishedNouns);
      translatedTokens.push(translated);
    }

    return translatedTokens;
  }

  /**
   * Replaces known multi-word phrases with placeholder markers to preserve order.
   */
  extractPhrases(text) {
    let processedText = text;
    const phrasesFound = [];

    // Sort phrases by length descending to match longest phrases first
    const sortedPhrases = [...this.dictionary.phrases].sort((a, b) => b.syii.length - a.syii.length);

    sortedPhrases.forEach((phrase) => {
      const regex = new RegExp(`\\b${this.escapeRegExp(phrase.syii)}\\b`, "gi");
      processedText = processedText.replace(regex, (match) => {
        const placeholder = `___PHRASE_${phrasesFound.length}___`;
        
        // Preserve capitalization of match if title-cased
        let resolvedEnglish = phrase.english;
        if (match[0] === match[0].toUpperCase()) {
          resolvedEnglish = resolvedEnglish.charAt(0).toUpperCase() + resolvedEnglish.slice(1);
        }

        phrasesFound.push({
          original: match,
          english: resolvedEnglish,
          confidence: phrase.confidence || "high",
          isUncertain: false,
          note: phrase.notes || "Known phrase"
        });

        return placeholder;
      });
    });

    return { processedText, phrasesFound };
  }

  /**
   * Lightweight noun extractor to support 'sooweh' contextual resolution.
   */
  extractEstablishedNouns(text) {
    const nouns = [];
    // Common indicators preceding nouns: mask, phone, game, car, song, stuff, etc.
    const nounMatchRegex = /\b(?:the|a|an|my|your|his|her|its|solis's|omar's)\s+([a-z]{3,})\b/gi;
    let match;

    while ((match = nounMatchRegex.exec(text)) !== null) {
      const word = match[1].toLowerCase();
      // Exclude common non-noun words
      if (!["very", "really", "so", "hot", "cool", "bad", "good"].includes(word)) {
        nouns.push(word);
      }
    }
    return nouns;
  }

  /**
   * Translates an individual token applying rules in priority order.
   */
  translateSingleToken(token, prevWord, nextWord, fullContext, establishedNouns) {
    // Separate punctuation
    const cleanMatch = token.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
    if (!cleanMatch) {
      return { original: token, english: token, confidence: "high", isUncertain: false };
    }

    const [, leadPunct, coreWord, tailPunct] = cleanMatch;
    const lower = coreWord.toLowerCase();
    let resultText = coreWord;
    let confidence = "high";
    let isUncertain = false;
    let note = "";

    // 1. Check Dictionary for single words
    if (this.dictionary.words[lower]) {
      resultText = this.dictionary.words[lower];
    }
    // 2. Check 'soid' Contextual System
    else if (lower === "soid") {
      const res = this.rules.resolveSoid(prevWord, nextWord, fullContext);
      resultText = res.text;
      confidence = res.confidence;
      if (confidence === "uncertain") isUncertain = true;
    }
    // 3. Check 'sooweh' Contextual System
    else if (lower === "sooweh") {
      const res = this.rules.resolveSooweh(prevWord, nextWord, establishedNouns);
      resultText = res.text;
      confidence = res.confidence;
      if (confidence === "uncertain") isUncertain = true;
    }
    // 4. Check '-istan' sentence ending suffix
    else if (lower.endsWith("istan")) {
      const res = this.rules.processIstanSuffix(coreWord + tailPunct);
      if (res.transformed) {
        resultText = res.text;
        const finalPunct = res.punctuation || ".";
        return this.formatTokenResult(leadPunct, coreWord, resultText, finalPunct, "high", false, "Stripped sentence-ending -istan");
      }
    }
    // 5. Check '-oid' suffix variations
    else if (lower.endsWith("oid") || lower === "oid") {
      const res = this.rules.processOidSuffix(coreWord, nextWord);
      if (res.transformed) {
        resultText = res.text;
        confidence = res.confidence || "high";
      }
    }
    // 6. Check phonology / morphology rules (-age, -goose, -sploot, rolled r, etc.)
    else {
      const morphRes = this.rules.processMorphology(coreWord);
      if (morphRes.confidence !== "none") {
        resultText = morphRes.text;
        confidence = morphRes.confidence;
      } else {
        // Unknown Syii word - preserve original, mark as uncertain/untranslated
        if (this.isLikelySyiiForm(coreWord)) {
          isUncertain = true;
          note = "Unrecognized Syii transformation";
        }
      }
    }

    // Preserve casing (Capitalize output if input was capitalized)
    if (coreWord[0] === coreWord[0].toUpperCase() && resultText.length > 0) {
      resultText = resultText.charAt(0).toUpperCase() + resultText.slice(1);
    }

    return this.formatTokenResult(leadPunct, coreWord, resultText, tailPunct, confidence, isUncertain, note);
  }

  formatTokenResult(leadPunct, originalCore, englishCore, tailPunct, confidence, isUncertain, note) {
    return {
      original: leadPunct + originalCore + tailPunct,
      english: leadPunct + englishCore + tailPunct,
      confidence,
      isUncertain,
      note
    };
  }

  isLikelySyiiForm(word) {
    const w = word.toLowerCase();
    return w.endsWith("syii") || w.endsWith("sploot") || w.includes("rrr") || w.endsWith("goose");
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// UI Initialization & Event Handlers
document.addEventListener("DOMContentLoaded", () => {
  const translator = new SyiiTranslator();

  const syiiInput = document.getElementById("syiiInput");
  const translateBtn = document.getElementById("translateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const englishOutput = document.getElementById("englishOutput");
  const charCounter = document.getElementById("charCounter");
  const exampleChips = document.querySelectorAll(".example-chip");

  // Character Counter
  syiiInput.addEventListener("input", () => {
    charCounter.textContent = `${syiiInput.value.length} chars`;
  });

  // Perform Translation
  function runTranslation() {
    const rawInput = syiiInput.value;
    if (!rawInput.trim()) {
      englishOutput.innerHTML = `<span class="placeholder-text">Translation will appear here...</span>`;
      return;
    }

    const tokens = translator.translate(rawInput);

    // Build HTML output with uncertainty highlights
    const htmlParts = tokens.map((token) => {
      if (token.isUncertain) {
        return `<span class="uncertain-word" title="${token.note || 'Uncertain translation'}">${escapeHtml(token.english)}</span>`;
      }
      return escapeHtml(token.english);
    });

    // Reconstruct paragraph structure and capitalization
    let formattedEnglish = htmlParts.join(" ");
    // Sentence-case auto fix after period
    formattedEnglish = formattedEnglish.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    englishOutput.innerHTML = formattedEnglish;
  }

  translateBtn.addEventListener("click", runTranslation);

  // Live auto-translate on typing with debounce
  let debounceTimer;
  syiiInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runTranslation, 250);
  });

  // Clear Input
  clearBtn.addEventListener("click", () => {
    syiiInput.value = "";
    englishOutput.innerHTML = `<span class="placeholder-text">Translation will appear here...</span>`;
    charCounter.textContent = "0 chars";
    syiiInput.focus();
  });

  // Copy Output
  copyBtn.addEventListener("click", () => {
    const textToCopy = englishOutput.innerText;
    if (!textToCopy || textToCopy === "Translation will appear here...") return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });
  });

  // Clickable Example Chips
  exampleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      syiiInput.value = chip.dataset.text;
      charCounter.textContent = `${syiiInput.value.length} chars`;
      runTranslation();
    });
  });

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
