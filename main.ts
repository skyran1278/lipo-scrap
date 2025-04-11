import * as cheerio from "https://esm.sh/cheerio@1.0.0";
import { I18nField } from "./i18n-field.interface.ts";
import { StampDetail } from "./stamp-detail.interface.ts";
import { Stamp } from "./stamp.interface.ts";

export interface CryptoStamp {
  totalIssue?: string;
}

/************************************************
 * 2. Constants – URLs & key‑to‑field mapping   *
 ************************************************/

/** German table header → StampDetail property name (or other target) */
const DETAIL_MAP: Record<
  string,
  keyof StampDetail | "stampNo" | "crypto.totalIssue"
> = {
  Ausgabe: "issue",
  Edition: "edition",
  Ausgabeauflage: "issueAmount",
  Bogenformat: "sheetFormat",
  Druck: "printer",
  Gestaltung: "design",
  Jahr: "year",
  Format: "format",
  "Michel-Nummer": "michelNumber",
  Nominale: "faceValue",
  Zähnung: "perforation",
  Artikelart: "articleType",
  Erhaltung: "conservation",
  Motiv: "motive",
  Klebart: "adhesiveType",
  Papier: "paper",
  Artikelnummer: "stampNo",
  Gesamtauflage: "crypto.totalIssue",
};

/************************
 * 3. Low‑level helpers *
 ************************/
async function loadHtml(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  return cheerio.load(html);
}

/*********************************
 * 4. Pure parsers (no side‑effects)
 *********************************/
function parseTitle($: cheerio.CheerioAPI) {
  return $("h1.product-name").text().trim();
}

function parseImage($: cheerio.CheerioAPI) {
  const src = $(".product-image img").attr("src");
  return src
    ? src.startsWith("http")
      ? src
      : `https://www.philatelie.li/${src}`
    : "";
}

function parseDetailsTable($: cheerio.CheerioAPI) {
  const out: Record<string, string> = {};
  $(".product-properties table tr").each((_, tr) => {
    const key = $(tr).find("th").text().trim();
    const val = $(tr).find("td").text().trim();
    if (key && val) out[key] = val;
  });
  return out;
}

/****************************************************
 * 5. Mapper – converts raw table to domain object  *
 ****************************************************/
function mapToStamp(
  titles: I18nField,
  raw: Record<string, string>,
  imageUrl: string,
  url: string
): Stamp {
  const detail: StampDetail = {};
  const crypto: CryptoStamp = {};

  // iterate once through raw table & dispatch
  Object.entries(raw).forEach(([deKey, value]) => {
    const target = DETAIL_MAP[deKey];
    if (!target) return;

    if (target.startsWith("crypto.")) {
      const k = target.split(".")[1] as keyof CryptoStamp;
      crypto[k] = value;
    } else if (target === "stampNo") {
      /* handled outside */
    } else if (typeof detail[target as keyof StampDetail] === "object") {
      // I18n sub‑field
      (detail as any)[target] = { de: value };
    } else {
      (detail as any)[target] = value;
    }
  });

  return {
    status: "PUBLISHED",
    type: "KRYPTOMARKE",
    url,
    title: titles,
    summary: titles,
    descriptions: [],
    stampNo: raw["Artikelnummer"] ?? "",
    keyword: { de: "Erdmännchen", en: "Meerkat" },
    image: { url: imageUrl },
    detail,
    cryptoStamp: crypto,
  };
}

/************************************
 * 6. Orchestrator – the “use‑case” *
 ************************************/
export async function scrapeMeerkat(
  DE_URL: string,
  EN_URL: string
): Promise<Stamp> {
  // fetch both languages in parallel
  const [$de, $en] = await Promise.all([loadHtml(DE_URL), loadHtml(EN_URL)]);

  // 1️⃣ parse
  const titles = { de: parseTitle($de), en: parseTitle($en) };
  const image = parseImage($de);
  const table = parseDetailsTable($de);

  // 2️⃣ map to final structure
  return mapToStamp(titles, table, image, DE_URL);
}

/******************************
 * 4. Orchestrator & CLI hook *
 ******************************/
if (import.meta.main) {
  const DE_URL = `https://www.philatelie.li/pi/Kryptobriefmarken/Wertzeichen/Kryptobriefmarke-Nr-2-The-Meerkat.html`;
  const EN_URL = `https://www.philatelie.li/pi/en/crypto-stamps/Stamps/Crypto-Stamp-Nr-2-The-Meerkat.html`;

  const stamp = await scrapeMeerkat(DE_URL, EN_URL);
  console.log(JSON.stringify(stamp, null, 2));
}
