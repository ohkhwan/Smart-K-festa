
'use server';

import { festivalPlanning, type FestivalPlanningInput, type FestivalPlanningOutput } from '@/ai/flows/festival-planning';
import { 
    type PredictionApiPayload,
    type FestivalConsultingFormValues, 
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
export async function getCongestionForecastAction(payload: PredictionApiPayload): Promise<ActionResult> {
  try {
    // The 'payload' already contains the necessary data structured for the Python script.
    // If your AI flow (congestionForecast) needs a different structure (CongestionForecastInput),
    // you would map 'payload' to 'CongestionForecastInput' here.
    // However, the goal is to send 'payload' to the Python script via an API route.

    // Make the API call to your backend endpoint that runs the Python script
    // Ensure NEXT_PUBLIC_APP_URL is set in your environment variables
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/predict-visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the structured payload
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return { success: false, error: errorBody.message || `API Error: ${response.status}` };
    }

    const resultFromApi: { success: boolean; predictedVisitors?: number; message?: string } = await response.json();

    // Ensure predictedVisitors is a number if success is true
    if (resultFromApi.success && typeof resultFromApi.predictedVisitors === 'number') {
      // Construct CongestionForecastResults based on the API response.
      // CongestionForecastOutput currently only has totalExpectedVisitors.
      // If your Python script or API flow provides more, update CongestionForecastOutput in schemas.ts
      const resultsData: CongestionForecastResults = {
        congestionForecast: { // This object should match CongestionForecastOutput
          totalExpectedVisitors: resultFromApi.predictedVisitors
 }
      };
      return { success: true, data: resultsData };
    } else {
      // Handle cases where API might return success: true but no predictedVisitors, or success: false
      return { success: false, error: resultFromApi.message || '예측 결과를 가져오는데 실패했습니다.' };
    }
  } catch (error) {
    console.error('Error in getCongestionForecastAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 혼잡도 예측 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
