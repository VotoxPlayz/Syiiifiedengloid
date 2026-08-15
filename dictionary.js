/**
 * Syii-Fried Engloid Dictionary
 * Holds established multi-word phrases, lexicalised words, and lookup maps.
 */

const SYII_DICTIONARY = {
  // Multi-word phrases (evaluated FIRST before single words)
  // Keys must be lowercase for matching.
  phrases: [
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
    "dosyii": "doing"
  }
};
