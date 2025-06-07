import { z } from 'zod';
import type { FestivalPlanningOutput } from '@/ai/flows/festival-planning';
import type { CongestionForecastOutput } from '@/ai/flows/congestion-forecast-flow';

// Schema for Festival Consultation (formerly consultationSchema)
export const festivalConsultingSchema = z.object({
  region: z.string().min(1, "광역자치단체를 선택해주세요."),
  municipality: z.string().min(1, "기초자치단체 혹은 시/군/구를 선택해주세요."),
  date: z.date({
    required_error: "날짜를 선택해주세요.",
    invalid_type_error: "유효한 날짜를 선택해주세요."
  }),
  budget: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/,/g, ''));
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z.number({
      required_error: "축제 예산을 입력해주세요.",
      invalid_type_error: "예산은 숫자로 입력해주세요."
    }).positive("예산은 0보다 커야 합니다.")
  ),
});
export type FestivalConsultingFormValues = z.infer<typeof festivalConsultingSchema>;


// Schema for Congestion Forecast
export const festivalTypes = ["문화관광", "문화예술", "생태자연", "전통역사", "주민화합", "지역특산물", "체험", "기타"] as const;

export const congestionForecastSchema = z.object({
  region: z.string().min(1, "광역자치단체를 선택해주세요."),
  municipality: z.string().min(1, "기초자치단체 혹은 시/군/구를 선택해주세요."),
  budget: z.string().min(1, { message: "예산을 입력해주세요." }),
  //budget: z.string().nonempty("예산을 입력해주세요.").regex(/^\d{1,3}(,\d{3})*(\.\d+)?$/, "유효한 예산 금액을 입력해주세요 (예: 1,000,000). 백만원 단위로 자동 변환됩니다."),
  date: z.date({
    required_error: "일자를 선택해주세요.",
    invalid_type_error: "유효한 일자를 선택해주세요."
  }),  
  festivalType: z.enum(festivalTypes, {
    required_error: "축제 종류를 선택해주세요."
  })
});
export type CongestionForecastFormValues = z.infer<typeof congestionForecastSchema>;

// Results for Festival Consultation
export interface FestivalConsultationResults {
  festivalPlanning?: FestivalPlanningOutput;
}

// Payload for the Python prediction API
export interface PredictionApiPayload {
  '광역자치단체': string;
  '기초자치단체 시/군/구': string;
  '읍/면/동': string;
  '축제 시작일': string; // YYYY-MM-DD
  '축제 종류': string;
  '예산': number; // In millions
}

// Results for Congestion Forecast
export interface CongestionForecastResults {
  congestionForecast?: CongestionForecastOutput;
}

// Generic Action Result
export interface ActionResult {
  success: boolean;
  data?: FestivalConsultationResults | CongestionForecastResults;
  error?: string;
}
