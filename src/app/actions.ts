
'use server';

import { festivalPlanning, type FestivalPlanningInput, type FestivalPlanningOutput } from '@/ai/flows/festival-planning';
import { congestionForecast, type CongestionForecastInput, type CongestionForecastOutput } from '@/ai/flows/congestion-forecast-flow';
import { 
    type FestivalConsultingFormValues, 
    type CongestionForecastFormValues,
    type ActionResult, // Import ActionResult from schemas
    type FestivalConsultationResults, // Import FestivalConsultationResults from schemas
    type CongestionForecastResults // Import CongestionForecastResults from schemas
} from './schemas';
import { format } from 'date-fns';
import { regions as regionData } from '@/lib/korea-regions';

// getRegionLabel is now an internal helper function, not exported
const getRegionLabel = (regionValue: string) => {
  const region = regionData.find(r => r.value === regionValue);
  return region ? region.label : regionValue;
}

// Action for Festival Consultation
export async function getFestivalConsultationAction(values: FestivalConsultingFormValues): Promise<ActionResult> {
  try {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    const regionLabel = getRegionLabel(values.region);
    const fullRegionInfo = `${regionLabel} ${values.municipality}`;

    const festivalInput: FestivalPlanningInput = {
      region: fullRegionInfo,
      date: formattedDate,
      budget: values.budget,
      localData: `대한민국 ${fullRegionInfo} 지역의 일반적인 민원 사항, 소셜 미디어 동향, 주민 관심사, 기후 데이터, 교통 정보 및 주요 특산물 판매 데이터를 종합적으로 고려합니다.`,
    };

    const festivalResult = await festivalPlanning(festivalInput);
    
    const resultsData: FestivalConsultationResults = { // Explicitly type for clarity
        festivalPlanning: festivalResult,
    };

    return {
      success: true,
      data: resultsData,
    };
  } catch (error) {
    console.error('Error in getFestivalConsultationAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 축제 컨설팅 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}

// New Action for Congestion Forecast
export async function getCongestionForecastAction(values: CongestionForecastFormValues, posterDataUri: string): Promise<ActionResult> {
  try {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    const regionLabel = getRegionLabel(values.region);
    const fullRegionInfo = `${regionLabel} ${values.municipality}`;

    const input: CongestionForecastInput = {
      date: formattedDate,
      duration: values.duration,
      frequency: values.frequency,
      festivalType: values.festivalType,
      posterDataUri: posterDataUri,
      slogan: values.slogan,
      region: fullRegionInfo,
    };

    const result = await congestionForecast(input);
    
    const resultsData: CongestionForecastResults = { // Explicitly type for clarity
        congestionForecast: result,
    };

    return {
      success: true,
      data: resultsData,
    };
  } catch (error) {
    console.error('Error in getCongestionForecastAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 혼잡도 예측 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
