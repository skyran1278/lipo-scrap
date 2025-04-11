import { I18nField } from "./i18n-field.interface.ts";
import { ImageField } from "./image-field.interface.ts";
import { StampDetail } from "./stamp-detail.interface.ts";

export interface Stamp {
  status: "PUBLISHED";
  type: "CRYPTO";
  url: string;
  title: I18nField;
  summary: I18nField;
  descriptions: I18nField[];
  stampNo: string;
  keyword: I18nField;
  image: ImageField;
  detail: StampDetail;
}
