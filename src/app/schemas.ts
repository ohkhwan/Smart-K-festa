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
  date: z.date({
    required_error: "일자를 선택해주세요.",
    invalid_type_error: "유효한 일자를 선택해주세요."
  }),
  duration: z.number({
    required_error: "진행 기간을 입력해주세요.",
    invalid_type_error: "진행 기간은 숫자로 입력해주세요."
  }).int().min(1, "진행 기간은 최소 1일 이상이어야 합니다."),
  frequency: z.number({
    required_error: "진행 횟수를 입력해주세요.",
    invalid_type_error: "진행 횟수는 숫자로 입력해주세요."
  }).int().min(1, "진행 횟수는 최소 1회 이상이어야 합니다."),
  festivalType: z.enum(festivalTypes, {
    required_error: "축제 종류를 선택해주세요."
  }),
  slogan: z.string().min(1, "축제 슬로건을 입력해주세요.").max(100, "슬로건은 100자 이내로 입력해주세요."),
  region: z.string().min(1, "광역자치단체를 선택해주세요."),
  municipality: z.string().min(1, "기초자치단체 혹은 시/군/구를 선택해주세요."),
});
export type CongestionForecastFormValues = z.infer<typeof congestionForecastSchema>;

// Results for Festival Consultation
export interface FestivalConsultationResults {
  festivalPlanning?: FestivalPlanningOutput;
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
