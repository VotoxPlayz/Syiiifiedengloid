/**
 * Syii-Fried Engloid Dictionary
 * Holds established multi-word phrases, lexicalised words, and lookup maps.
 */

const SYII_DICTIONARY = {
  // Multi-word phrases (evaluated FIRST before single words)
  // Keys must be lowercase for matching.
  phrases: [
    {
      syii: "i rrrrrr",
      english: "I don't know",
      confidence: "high",
      notes: "Lexicalised denial of knowledge, responsibility, or intent (long roll)."
    },
    {
      syii: "i rrrrr",
      english: "I don't know",
      confidence: "high",
      notes: "General denial of knowledge, responsibility, or intent."
    },
    {
      syii: "ii ii",
      english: "it is",
      confidence: "high",
      notes: "Established contraction/phrase."
    },
    {
      syii: "cii slii",
      english: "can't sleep",
      confidence: "high",
      notes: "Phonological compression of 'can't sleep'."
    },
    {
      syii: "what the sooweh",
      english: "what the hell",
      confidence: "medium",
      notes: "Swear/exclamation replacement context for sooweh."
    },
    {
      syii: "what the syii",
      english: "what the fuck",
      confidence: "high",
      notes: "Exclamation replacement using syii as a standalone swearing noun."
    },
    {
      syii: "how are yee",
      english: "how are you",
      confidence: "high",
      notes: "Standard greeting form."
    },
    {
      syii: "do yee want to",
      english: "do you want to",
      confidence: "high",
      notes: "Phonetic binding for 'you' -> 'yee'."
    },
    {
      syii: "ding ding ring for soid",
      english: "ding ding ring for sex",
      confidence: "high",
      notes: "Established contextual idiom for 'soid' -> 'sex'."
    }
  ],

  // Direct lexical replacements (single words)
  words: {
    "yee": "you",
    "witnoose": "witness",
    "jeezgoose": "Jesus",
    "agoose": "anus",
    "sitch": "situation",
    "preesh": "appreciate",
    "ob": "obese",
    "humesyii": "human",
    "gosyii": "going",
    "dosyii": "doing",
    "dooid": "doing",
    "talkoid": "talking",
    "thinkoid": "thinking",
    "bubbloid": "bubbly",
    "probbloid": "probably",
    "realloid": "really",
    "tuffage": "tuff",
    "dyussy": "dussy"
  }
};
