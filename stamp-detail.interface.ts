import { I18nField } from "./i18n-field.interface.ts";

export interface StampDetail {
  issue?: string;
  edition?: string;
  issueAmount?: string;
  sheetFormat?: string;
  printer?: string;
  design?: string;
  year?: string;
  format?: string;
  michelNumber?: string;
  faceValue?: string;
  perforation?: string;
  articleType?: I18nField;
  conservation?: I18nField;
  motive?: I18nField;
  print?: I18nField;
  adhesiveType?: I18nField;
  paper?: I18nField;
}
