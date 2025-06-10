
'use server';

import { festivalPlanning, type FestivalPlanningInput } from '@/ai/flows/festival-planning';
// import { congestionForecast, type CongestionForecastInput } from '@/ai/flows/congestion-forecast-flow'; // Python API 사용으로 주석 처리 또는 삭제
import { 
    type FestivalConsultingFormValues, 
    type ActionResult, 
    type FestivalConsultationResults, 
    type CongestionForecastResults,
    type CongestionForecastFormValues,
    type PredictionApiPayload // Python API 요청 페이로드 타입
} from './schemas';
import { format } from 'date-fns';
import { regions as regionData, getMunicipalitiesForRegion, getDongForMunicipality } from '@/lib/korea-regions';

const getRegionLabel = (regionValue: string) => {
  const region = regionData.find(r => r.value === regionValue);
  return region ? region.label : regionValue;
};

const getMunicipalityLabel = (regionValue: string, municipalityValue: string) => {
  const municipalities = getMunicipalitiesForRegion(regionValue);
  const municipality = municipalities.find(m => m.value === municipalityValue);
  return municipality ? municipality.label : municipalityValue;
};

// Festival Consultation Action (기존 로직 유지)
export async function getFestivalConsultationAction(values: FestivalConsultingFormValues): Promise<ActionResult> {
  try {
    const formattedDate = format(values.date, 'yyyy-MM-dd');
    const regionLabel = getRegionLabel(values.region);
    const fullRegionInfo = `${regionLabel} ${values.municipality}`; // 예: "서울특별시 강남구"

    const festivalInput: FestivalPlanningInput = {
      region: fullRegionInfo,
      date: formattedDate,
      budget: values.budget, // 원 단위로 이미 변환된 값이라고 가정 (스키마 확인 필요)
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

// Congestion Forecast Action - Python Flask API 호출로 변경
export async function getCongestionForecastAction(values: CongestionForecastFormValues): Promise<ActionResult> {
  try {
    const budgetInMillions = parseFloat(values.budget.replace(/,/g, ''));
    if (isNaN(budgetInMillions)) {
        return { success: false, error: '예산은 유효한 숫자여야 합니다.' };
    }

    const regionLabel = getRegionLabel(values.region);
    const municipalityLabel = getMunicipalityLabel(values.region, values.municipality);
    // `getDongForMunicipality`는 `korea-regions.ts`에 추가 필요 (또는 대표값 직접 사용)
    // 현재 `korea-regions.ts`의 `Municipality` 인터페이스에는 `dong`이 있으므로 사용 가능
    const dongName = getDongForMunicipality(values.region, values.municipality) || municipalityLabel; // dong 정보가 없으면 기초단체명 사용

    const payload: PredictionApiPayload = {
      '광역자치단체': regionLabel,
      '기초자치단체 시/군/구': municipalityLabel,
      '읍/면/동': dongName, // 대표 읍면동 정보 또는 기초단체명 사용
      '축제 시작일': format(values.date, 'yyyy-MM-dd'),
      '축제 종류': values.festivalType,
      '예산': budgetInMillions, // 백만원 단위 숫자
    };
    
    console.log("Sending payload to Python API:", JSON.stringify(payload));

    const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000/predict';
    console.log("Python API URL:", pythonApiUrl);

    const response = await fetch(pythonApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData = { error: 'Python API 요청 실패. 상태 코드: ' + response.status };
      try {
        errorData = await response.json();
      } catch (e) {
        // JSON 파싱 실패 시, 응답 텍스트를 사용
        const errorText = await response.text();
        errorData.error = `Python API 응답 처리 오류: ${response.status} - ${errorText || '내용 없음'}`;
      }
      console.error('Python API error:', errorData);
      throw new Error(errorData.error);
    }

    const resultFromPythonApi = await response.json();

    if (typeof resultFromPythonApi.predicted_visitors !== 'number') {
        console.error('Invalid response structure from Python API:', resultFromPythonApi);
        throw new Error('Python API로부터 유효하지 않은 방문객 수 응답을 받았습니다.');
    }
    
    const resultsData: CongestionForecastResults = {
      congestionForecast: { 
        totalExpectedVisitors: resultFromPythonApi.predicted_visitors
      }
    };
    return { success: true, data: resultsData };

  } catch (error) {
    console.error('Error in getCongestionForecastAction (Python API):', error);
    let errorMessage = 'AI 혼잡도 예측 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // 네트워크 오류 등 fetch 자체에서 발생한 오류일 경우, 좀 더 일반적인 메시지
    if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('networkerror')) {
        errorMessage = `Python AI 서버(${process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000/predict'})에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

    