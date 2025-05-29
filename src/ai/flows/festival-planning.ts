
// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview A festival planning AI agent.
 *
 * - festivalPlanning - A function that handles the festival planning process.
 * - FestivalPlanningInput - The input type for the festivalPlanning function.
 * - FestivalPlanningOutput - The return type for the festivalPlanning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { differenceInDays, parseISO, addHours, format as formatDateFns } from 'date-fns';

const FestivalPlanningInputSchema = z.object({
  region: z.string().describe('The region where the festival will be held.'),
  date: z.string().describe('The desired date for the festival (YYYY-MM-DD).'),
  budget: z.number().describe('The budget allocated for the festival.'),
  localData: z
    .string()
    .describe(
      'A comprehensive summary of local data, including resident complaints, social media exposure, public interest, climate data, traffic data, and local specialty sales.'
    ),
});
export type FestivalPlanningInput = z.infer<typeof FestivalPlanningInputSchema>;

const HourlyWeatherForecastSchema = z.object({
  time: z.string().describe('예보 시간 (HH:mm 형식, 예: "09:00").'),
  condition: z.string().describe('날씨 상태 (한국어, 예: "맑음", "구름 조금", "약한 비").'),
  temperature: z.number().describe('섭씨 온도.'),
  precipitationChance: z.number().min(0).max(100).describe('강수 확률 (0-100%).'),
});
export type HourlyWeatherForecast = z.infer<typeof HourlyWeatherForecastSchema>;

const FestivalPlanningOutputSchema = z.object({
  themeSuggestion: z.string().describe('AI-generated suggestion for the festival theme (Korean).'),
  dateRecommendation: z.string().describe('AI-driven recommendation for the optimal festival date (Korean).'),
  promotionStrategy: z
    .string()
    .describe('AI-based strategy for promoting the festival to maximize engagement (Korean).'),
  dailyWeatherSummary: z.string().describe('추천 날짜의 전반적인 날씨 요약 (한국어).'),
  hourlyWeatherForecasts: z.array(HourlyWeatherForecastSchema).describe('추천 날짜의 시간대별 날씨 예보.'),
  trafficCongestionScore: z.number().min(1).max(10).describe('Traffic congestion score for the recommended date (1: low, 10: high).'),
});
export type FestivalPlanningOutput = z.infer<typeof FestivalPlanningOutputSchema>;


// Tool to get simulated weather data
const getWeatherDataTool = ai.defineTool(
  {
    name: 'getWeatherData',
    description: 'Provides a simulated daily and hourly weather forecast for a given date. For real data, integrate a dedicated weather API using WEATHER_API_KEY (e.g., OpenWeatherMap).',
    inputSchema: z.object({
      date: z.string().describe('The date for the weather forecast (YYYY-MM-DD).'),
      // region: z.string().describe('The region for weather context, not used in current simulation but useful for real APIs.'),
    }),
    outputSchema: z.object({
      dailySummary: z.string().describe('Overall weather summary for the day in Korean.'),
      hourlyForecasts: z.array(HourlyWeatherForecastSchema)
        .describe('Simulated hourly weather forecast for the specified date.'),
    }),
  },
  async ({ date }) => {
    // const apiKey = process.env.WEATHER_API_KEY;
    // if (apiKey) {
    //   // TODO: Implement actual weather API call here
    //   // Example: Fetch data from OpenWeatherMap or similar
    //   // You would need to parse the API response and map it to the HourlyWeatherForecastSchema
    //   // For example, for OpenWeatherMap's 5 day / 3 hour forecast:
    //   // const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${apiKey}&units=metric&lang=kr`);
    //   // if (!response.ok) throw new Error("Weather API request failed");
    //   // const data = await response.json();
    //   // const relevantForecasts = data.list.filter(item => item.dt_txt.startsWith(date));
    //   // if (!relevantForecasts.length) return { dailySummary: "해당 날짜의 실제 예보를 찾을 수 없습니다. (OpenWeatherMap)", hourlyForecasts: [] };
    //   //
    //   // const hourlyForecasts: HourlyWeatherForecast[] = relevantForecasts.map(item => ({
    //   //   time: formatDateFns(new Date(item.dt * 1000), "HH:mm"),
    //   //   condition: item.weather[0]?.description || "정보 없음",
    //   //   temperature: parseFloat(item.main.temp.toFixed(1)),
    //   //   precipitationChance: Math.round((item.pop || 0) * 100), // 'pop' is probability of precipitation
    //   // }));
    //   // const dailySummary = hourlyForecasts.length > 0 ? `실제 API (${hourlyForecasts[0].condition} 등)에서 가져온 날씨 요약` : "날씨 정보 없음";
    //   // return { dailySummary, hourlyForecasts };
    //   console.warn("WEATHER_API_KEY is set, but actual API call logic in getWeatherDataTool is a placeholder. Using simulated data.");
    // } else {
    //   console.warn("WEATHER_API_KEY not set in .env. Using simulated weather data. Please set it for real data.");
    // }

    // Fallback to simulated data
    const today = new Date();
    today.setHours(0,0,0,0); // Compare dates only
    let targetDate;
    try {
      targetDate = parseISO(date);
      if (isNaN(targetDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (e) {
      console.error("Invalid date provided to getWeatherDataTool:", date);
      return {
        dailySummary: "유효하지 않은 날짜 형식입니다.",
        hourlyForecasts: [],
      };
    }

    const daysDiff = differenceInDays(targetDate, today);

    const simulatedHourlyForecasts: HourlyWeatherForecast[] = [];
    let overallConditions: string[] = [];

    const baseTemp = 15 + Math.random() * 10; // Base temperature for the day

    // Simulate 8 data points (every 3 hours for 24 hours)
    // For future dates, predictability decreases.
    // For past dates, it should ideally fetch historical data or indicate none.
    
    if (daysDiff < 0) { // Past date
      return {
        dailySummary: "과거 날짜에 대한 시뮬레이션된 날씨 정보는 제공되지 않습니다. 실제 API를 연동하세요.",
        hourlyForecasts: Array(8).fill(null).map((_, i) => ({
          time: formatDateFns(addHours(targetDate, i * 3), "HH:mm"),
          condition: "과거 데이터 없음",
          temperature: 0,
          precipitationChance: 0,
        })),
      };
    }

    for (let i = 0; i < 8; i++) { 
      const hour = i * 3; // 00:00, 03:00, 06:00, ..., 21:00
      const forecastTime = addHours(targetDate, hour);
      
      let condition = "맑음";
      // Simulate decreasing predictability for future dates by increasing randomness or chance of varied weather
      const predictabilityFactor = Math.max(0.1, 1 - (daysDiff * 0.05)); // More days in future = lower factor = more randomness

      let precipitationChance = Math.random() * 20 * (1/predictabilityFactor); // Default low chance, increases with less predictability
      precipitationChance = Math.min(100, Math.round(precipitationChance));


      if (Math.random() > predictabilityFactor * 0.8) { // Higher chance of deviation if less predictable
        condition = "구름 조금";
      } 
      if (Math.random() > predictabilityFactor * 0.9) {
        condition = "흐림";
        precipitationChance = Math.min(100, Math.round(Math.random() * 30 + 30 * (1/predictabilityFactor))); 
      } 
      if (Math.random() > predictabilityFactor * 0.95) {
        condition = "약한 비";
        precipitationChance = Math.min(100, Math.round(Math.random() * 40 + 50 * (1/predictabilityFactor)));
      }

      if (hour < 6 || hour >= 21) { // Night time adjustments
        if (condition === "맑음") condition = "대체로 맑음 (밤)";
      } else if (hour >= 6 && hour < 12 ) { // Morning adjustments
         if (condition === "맑음" && Math.random() < (0.15 / predictabilityFactor)) condition = "안개/엷은 안개";
      }


      // Simulate temperature variation throughout the day
      let temperature = baseTemp;
      if (hour >= 6 && hour < 9) temperature += Math.random() * 2; 
      else if (hour >= 9 && hour < 15) temperature += Math.random() * 4 + 1; // Peak afternoon
      else if (hour >= 15 && hour < 21) temperature -= Math.random() * 2; 
      else temperature -= Math.random() * 4; // Night drop
      
      temperature = parseFloat(temperature.toFixed(1));

      simulatedHourlyForecasts.push({
        time: formatDateFns(forecastTime, "HH:mm"),
        condition,
        temperature,
        precipitationChance,
      });
      if(!overallConditions.includes(condition) && !condition.includes("(밤)") && !condition.includes("안개")) {
          overallConditions.push(condition);
      }
    }
    
    let dailySummary = "전반적으로 양호한 날씨가 예상됩니다.";
    if (overallConditions.includes("약한 비")) {
      dailySummary = `때때로 약한 비가 예상됩니다. (예측 정확도 ${Math.round(predictabilityFactor*100)}% 수준)`;
    } else if (overallConditions.includes("흐림")) {
      dailySummary = `대체로 흐린 날씨가 예상됩니다. (예측 정확도 ${Math.round(predictabilityFactor*100)}% 수준)`;
    } else if (overallConditions.includes("구름 조금")){
      dailySummary = `가끔 구름이 끼는 날씨가 예상됩니다. (예측 정확도 ${Math.round(predictabilityFactor*100)}% 수준)`;
    } else if (overallConditions.length === 0 || overallConditions.every(c => c === "맑음")){
        dailySummary = `맑고 쾌청한 날씨가 예상됩니다. (예측 정확도 ${Math.round(predictabilityFactor*100)}% 수준)`;
    }


    return {
      dailySummary,
      hourlyForecasts: simulatedHourlyForecasts,
    };
  }
);

// Tool to get simulated traffic data
const getTrafficDataTool = ai.defineTool(
  {
    name: 'getTrafficData',
    description: 'Provides a traffic congestion score (1-10) for a given date and region. For real data, integrate a dedicated traffic API using TRAFFIC_API_KEY (e.g., Google Maps Distance Matrix API, TMAP API).',
    inputSchema: z.object({
      date: z.string().describe('The date for the traffic data (YYYY-MM-DD).'),
      region: z.string().describe('The region for the traffic data (e.g., "서울특별시 강남구").'),
    }),
    outputSchema: z.object({
      congestionScore: z.number().min(1).max(10).describe('교통 혼잡도 점수 (1: 원활, 10: 매우 혼잡)'),
    }),
  },
  async ({ date, region }) => {
    // const apiKey = process.env.TRAFFIC_API_KEY; // or GOOGLE_MAPS_API_KEY if using Google's services

    // if (apiKey) {
    //   // TODO: Replace with actual traffic API call
    //   // Example with a conceptual API:
    //   // const apiUrl = `https://your-traffic-api.com/data?date=${date}&region=${encodeURIComponent(region)}&apiKey=${apiKey}`;
    //   // const response = await fetch(apiUrl);
    //   // if (!response.ok) {
    //   //   console.error(`Traffic API request failed with status ${response.status}`);
    //   //   // Fallback to simulation or throw error
    //   // } else {
    //   //    const trafficApiData = await response.json();
    //   //    return { congestionScore: Math.min(10, Math.max(1, trafficApiData.score)) }; 
    //   // }
    //   console.warn("TRAFFIC_API_KEY (or equivalent) is set, but the actual API call logic in getTrafficDataTool is a placeholder. TODO: Implement the API call and data parsing. Falling back to simulation.");
    // } else {
    //   console.warn("TRAFFIC_API_KEY (or equivalent) not set in .env. Using simulated traffic data.");
    // }
    
    // Fallback to simulated data
    let score = Math.floor(Math.random() * 6) + 1; // Base score 1-6 (generally less congested)
    try {
        const parsedDate = parseISO(date);
        const dayOfWeek = parsedDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        const hour = parsedDate.getHours(); // Consider time of day if available, otherwise assume peak for festival

        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) { // Friday, Saturday, Sunday
          score += Math.floor(Math.random() * 2) + 1; // Weekend/Friday more congestion
        }
        // Simple peak hour simulation (assuming festival time might be in these ranges)
        if ((hour >= 7 && hour <=9) || (hour >=17 && hour <= 19)){
            score +=1;
        }

    } catch (error) {
      console.warn("Invalid date for traffic simulation, using base score:", date);
    }

    // Region based adjustment (very simplistic)
    const majorCities = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '수원', '성남', '고양', '용인', '창원'];
    if (majorCities.some(city => region.includes(city))) {
      score += Math.floor(Math.random() * 2) +1; // Major city increment
    }
    if (region.includes("강남") || region.includes("해운대") || region.includes("종로")) { // Specific busy districts
        score +=1;
    }

    return { congestionScore: Math.min(10, Math.max(1, Math.round(score))) };
  }
);

/*
async function getWeatherDataFromKMA({ stn, reg, tmfc, tmfc1, tmfc2, tmef1, tmef2, mode, disp, help, authKey }: {
 stn?: string;
 reg?: string;
 tmfc?: string;
 tmfc1?: string;
 tmfc2?: string;
 tmef1?: string;
 tmef2?: string;
 mode?: string;
 disp?: string;
 help?: string;
 authKey: string; // Changed from invalid hex to string for a real API key
}) {
  // TODO: Implement KMA API call using a library like axios or node-fetch
  // const KMA_API_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
  // Example params:
  // const params = {
  //   serviceKey: decodeURIComponent(authKey), // KMA service keys often need decoding
  //   pageNo: '1',
  //   numOfRows: '1000', // Adjust as needed
  //   dataType: 'JSON', // Or XML
  //   base_date: formatDateFns(new Date(), "yyyyMMdd"), // Needs to be calculated based on tmfc
  //   base_time: "0500", // Needs to be calculated
  //   nx: '60', // Example for Seoul, needs to be mapped from region
  //   ny: '127', // Example for Seoul
  // };
  // const queryString = new URLSearchParams(params).toString();
  // try {
  //   const response = await fetch(`${KMA_API_URL}?${queryString}`);
  //   if (!response.ok) {
  //     throw new Error(`KMA API request failed: ${response.statusText}`);
  //   }
  //   const data = await response.json();
  //   // TODO: Process API response (it's complex) and return weather data
  //   // KMA data has specific categories (PTY for precipitation type, SKY for sky condition, T1H for temp, etc.)
  //   // and needs careful parsing and mapping to HourlyWeatherForecastSchema
  //   return data;
  // } catch (error) {
  //   console.error("Error fetching KMA weather data:", error);
  //   throw error;
  // }
}
*/

export async function festivalPlanning(input: FestivalPlanningInput): Promise<FestivalPlanningOutput> {
  return festivalPlanningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'festivalPlanningPrompt',
  input: {schema: FestivalPlanningInputSchema},
  output: {schema: FestivalPlanningOutputSchema},
  tools: [getWeatherDataTool, getTrafficDataTool],
  prompt: `You are an AI-powered festival planning expert. Your goal is to provide the best possible recommendations for festival themes, dates, and promotional strategies based on the provided local data and constraints. All outputs should be in Korean.

  Region: {{{region}}}
  Target Date: {{{date}}}
  Budget: {{{budget}}}
  Local Data Summary: {{{localData}}}

  1.  First, use the 'getWeatherData' tool to get the daily weather summary and hourly forecasts for the 'Target Date'.
  2.  Then, use the 'getTrafficData' tool to get the traffic congestion score for the 'Target Date' and 'Region'.
  3.  Based on all available information including the daily weather summary, hourly weather forecasts (pay close attention to precipitation chances, extreme temperatures, and overall conditions like '안개' or '강풍' if the tool provides them), and traffic data:
      - Suggest a festival theme that will resonate with the local community and is suitable for the predicted weather.
      - Recommend an optimal date. This could be the target date or an adjusted one if weather/traffic are unfavorable. If adjusted, briefly state why (e.g., "우천 예상으로 하루 연기 제안", "교통 혼잡 심각하여 주중 제안"). Consider the hourly forecast to suggest best times or if indoor alternatives are needed.
      - Outline a promotional strategy that leverages the most effective channels and tactics.
  
  Ensure your response strictly follows the output schema, providing all fields: 'themeSuggestion', 'dateRecommendation', 'promotionStrategy', 'dailyWeatherSummary', 'hourlyWeatherForecasts', and 'trafficCongestionScore'.
  The 'dailyWeatherSummary' should be a brief, human-readable summary in Korean, incorporating the simulated predictability.
  The 'hourlyWeatherForecasts' should be an array of forecasts for different times of the day (usually 8 data points for 3-hourly updates).
  The 'trafficCongestionScore' should be the numerical score provided by the tool.
  `,
});

const festivalPlanningFlow = ai.defineFlow(
  {
    name: 'festivalPlanningFlow',
    inputSchema: FestivalPlanningInputSchema,
    outputSchema: FestivalPlanningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI did not return an output for festival planning.");
    }
    // Ensure all parts of the output are generated, even if tools had issues (though schema validation should catch this)
    return {
        themeSuggestion: output.themeSuggestion || "테마 제안 생성 중 오류 발생",
        dateRecommendation: output.dateRecommendation || "날짜 추천 생성 중 오류 발생",
        promotionStrategy: output.promotionStrategy || "홍보 전략 생성 중 오류 발생",
        dailyWeatherSummary: output.dailyWeatherSummary || "날씨 요약 정보 없음",
        hourlyWeatherForecasts: output.hourlyWeatherForecasts || [],
        trafficCongestionScore: typeof output.trafficCongestionScore === 'number' ? output.trafficCongestionScore : 5, // Default if missing
    };
  }
);

