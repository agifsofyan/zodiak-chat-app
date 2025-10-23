import { Zodiac } from "src/profile/dto/enum-zodiac.dto";

const ZODIAC_SEQUENCE: Zodiac[] = [
  Zodiac.RAT,
  Zodiac.OX,
  Zodiac.TIGER,
  Zodiac.RABBIT,
  Zodiac.DRAGON,
  Zodiac.SNAKE,
  Zodiac.HORSE,
  Zodiac.GOAT,
  Zodiac.MONKEY,
  Zodiac.ROOSTER,
  Zodiac.DOG,
  Zodiac.PIG,
];

/**
 * Get Chinese Zodiac by date of birth
 */
export function getChineseZodiacFromDate(date: Date): Zodiac {
  const baseYear = 1900; // cycle base year
  const year = date.getUTCFullYear();

  const index = (year - baseYear) % 12;
  return ZODIAC_SEQUENCE[index];
}
