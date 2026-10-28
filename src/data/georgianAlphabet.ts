import type {GeorgianLetter} from '../types/alphabet.ts';

// Each recording is named by its letter (ა.mp3 … ჰ.mp3); Vite turns each into a built URL.
const AUDIO_DIR = '../assets/audio/';
const audioFiles = import.meta.glob<string>('../assets/audio/*.mp3', {
  eager: true,
  import: 'default',
});

type LetterEntry = Omit<GeorgianLetter, 'audioSrc'>;

// The 33 modern Mkhedruli letters in alphabetical order (U+10D0–U+10F0).
// Transliteration follows Georgia's 2002 national romanization system.
const LETTERS: readonly LetterEntry[] = [
  {id: 'ani', character: 'ა', name: 'ანი', transliteration: 'a'},
  {id: 'bani', character: 'ბ', name: 'ბანი', transliteration: 'b'},
  {id: 'gani', character: 'გ', name: 'განი', transliteration: 'g'},
  {id: 'doni', character: 'დ', name: 'დონი', transliteration: 'd'},
  {id: 'eni', character: 'ე', name: 'ენი', transliteration: 'e'},
  {id: 'vini', character: 'ვ', name: 'ვინი', transliteration: 'v'},
  {id: 'zeni', character: 'ზ', name: 'ზენი', transliteration: 'z'},
  {id: 'tani', character: 'თ', name: 'თანი', transliteration: 't'},
  {id: 'ini', character: 'ი', name: 'ინი', transliteration: 'i'},
  {id: "k'ani", character: 'კ', name: 'კანი', transliteration: "k'"},
  {id: 'lasi', character: 'ლ', name: 'ლასი', transliteration: 'l'},
  {id: 'mani', character: 'მ', name: 'მანი', transliteration: 'm'},
  {id: 'nari', character: 'ნ', name: 'ნარი', transliteration: 'n'},
  {id: 'oni', character: 'ო', name: 'ონი', transliteration: 'o'},
  {id: "p'ari", character: 'პ', name: 'პარი', transliteration: "p'"},
  {id: 'zhani', character: 'ჟ', name: 'ჟანი', transliteration: 'zh'},
  {id: 'rae', character: 'რ', name: 'რაე', transliteration: 'r'},
  {id: 'sani', character: 'ს', name: 'სანი', transliteration: 's'},
  {id: "t'ari", character: 'ტ', name: 'ტარი', transliteration: "t'"},
  {id: 'uni', character: 'უ', name: 'უნი', transliteration: 'u'},
  {id: 'pari', character: 'ფ', name: 'ფარი', transliteration: 'p'},
  {id: 'kani', character: 'ქ', name: 'ქანი', transliteration: 'k'},
  {id: 'ghani', character: 'ღ', name: 'ღანი', transliteration: 'gh'},
  {id: "q'ari", character: 'ყ', name: 'ყარი', transliteration: "q'"},
  {id: 'shini', character: 'შ', name: 'შინი', transliteration: 'sh'},
  {id: 'chini', character: 'ჩ', name: 'ჩინი', transliteration: 'ch'},
  {id: 'tsani', character: 'ც', name: 'ცანი', transliteration: 'ts'},
  {id: 'dzili', character: 'ძ', name: 'ძილი', transliteration: 'dz'},
  {id: "ts'ili", character: 'წ', name: 'წილი', transliteration: "ts'"},
  {id: "ch'ari", character: 'ჭ', name: 'ჭარი', transliteration: "ch'"},
  {id: 'khani', character: 'ხ', name: 'ხანი', transliteration: 'kh'},
  {id: 'jani', character: 'ჯ', name: 'ჯანი', transliteration: 'j'},
  {id: 'hae', character: 'ჰ', name: 'ჰაე', transliteration: 'h'},
];

export const GEORGIAN_ALPHABET: readonly GeorgianLetter[] = LETTERS.map(
  (letter) => ({
    ...letter,
    audioSrc: audioFiles[`${AUDIO_DIR}${letter.character}.mp3`] ?? null,
  }),
);

const LETTERS_BY_ID = new Map(
  GEORGIAN_ALPHABET.map((letter) => [letter.id, letter]),
);

export function getLetterById(id: string): GeorgianLetter | undefined {
  return LETTERS_BY_ID.get(id);
}
