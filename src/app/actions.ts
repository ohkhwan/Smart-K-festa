
'use server';

import { festivalPlanning, type FestivalPlanningInput, type FestivalPlanningOutput } from '@/ai/flows/festival-planning';
import { congestionForecast, type CongestionForecastInput } from '@/ai/flows/congestion-forecast-flow'; // Updated import
import { 
    type FestivalConsultingFormValues, 
    type ActionResult, 
    type FestivalConsultationResults, 
    type CongestionForecastResults,
    type CongestionForecastFormValues // Added for new action
} from './schemas';
import { format } from 'date-fns';
import { regions as regionData, getMunicipalitiesForRegion, type Municipality } from '@/lib/korea-regions';

const getRegionLabel = (regionValue: string) => {
  const region = regionData.find(r => r.value === regionValue);
  return region ? region.label : regionValue;
};

const getMunicipalityLabel = (regionValue: string, municipalityValue: string) => {
  const municipalities = getMunicipalitiesForRegion(regionValue);
  const municipality = municipalities.find(m => m.value === municipalityValue);
  return municipality ? municipality.label : municipalityValue;
};

const getDongForMunicipality = (regionValue: string, municipalityValue: string): string | undefined => {
    const municipalities = getMunicipalitiesForRegion(regionValue);
    const municipality = municipalities.find(m => m.value === municipalityValue);
    return municipality?.dong;
};


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
    
    const resultsData: FestivalConsultationResults = { 
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

// Modified Action for Congestion Forecast using Genkit LLM
export async function getCongestionForecastAction(values: CongestionForecastFormValues): Promise<ActionResult> {
  try {
    const budgetInMillions = parseFloat(values.budget.replace(/,/g, ''));
    if (isNaN(budgetInMillions)) {
        return { success: false, error: '예산은 유효한 숫자여야 합니다.' };
    }

    const regionLabel = getRegionLabel(values.region);
    const municipalityLabel = getMunicipalityLabel(values.region, values.municipality);
    const dongName = getDongForMunicipality(values.region, values.municipality);

    const genkitInput: CongestionForecastInput = {
      regionName: regionLabel,
      municipalityName: municipalityLabel,
      dongName: dongName,
      date: format(values.date, 'yyyy-MM-dd'),
      festivalType: values.festivalType,
      budget: budgetInMillions,
    };

    const resultFromGenkit = await congestionForecast(genkitInput);
    
    const resultsData: CongestionForecastResults = {
      congestionForecast: { 
        totalExpectedVisitors: resultFromGenkit.totalExpectedVisitors
      }
    };
    return { success: true, data: resultsData };

  } catch (error) {
    console.error('Error in getCongestionForecastAction (Genkit):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 혼잡도 예측 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
