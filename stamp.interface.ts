import { I18nField } from "./i18n-field.interface.ts";
import { CryptoStamp } from "./main.ts";
import { StampDetail } from "./stamp-detail.interface.ts";

export interface Stamp {
  status: "PUBLISHED";
  type: "KRYPTOMARKE";
  url: string;
  title: I18nField;
  summary: I18nField;
  descriptions: I18nField[];
  stampNo: string;
  keyword: I18nField;
  image: { url: string };
  detail: StampDetail;
  cryptoStamp: CryptoStamp;
}
