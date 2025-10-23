import { Horoscope } from "src/profile/dto/enum-horoscope.dto";

interface HoroscopeRange {
  sign: Horoscope;
  start: { month: number; day: number };
  end: { month: number; day: number };
}

const HOROSCOPE_RANGES: HoroscopeRange[] = [
  { sign: Horoscope.ARIES,       start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { sign: Horoscope.TAURUS,      start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { sign: Horoscope.GEMINI,      start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
  { sign: Horoscope.CANCER,      start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
  { sign: Horoscope.LEO,         start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { sign: Horoscope.VIRGO,       start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { sign: Horoscope.LIBRA,       start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
  { sign: Horoscope.SCORPIO,     start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
  { sign: Horoscope.SAGITTARIUS, start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
  { sign: Horoscope.CAPRICORN,   start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { sign: Horoscope.AQUARIUS,    start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { sign: Horoscope.PISCES,      start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
];

export function getHoroscopeFromDate(date: Date): Horoscope {
  const month = date.getUTCMonth() + 1; // 1–12
  const day = date.getUTCDate();

  for (const { sign, start, end } of HOROSCOPE_RANGES) {
    if (start.month === 12 && end.month === 1) {
      if (
        (month === 12 && day >= start.day) ||
        (month === 1 && day <= end.day)
      ) {
        return sign;
      }
    } else if (
      (month === start.month && day >= start.day) ||
      (month === end.month && day <= end.day) ||
      (month > start.month && month < end.month)
    ) {
      return sign;
    }
  }

  throw new Error('Invalid date for horoscope calculation');
}

