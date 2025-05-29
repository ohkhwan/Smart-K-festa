
'use server';
/**
 * @fileOverview A festival congestion forecasting AI agent.
 *
 * - congestionForecast - A function that handles the festival congestion forecast process.
 * - CongestionForecastInput - The input type for the congestionForecast function.
 * - CongestionForecastOutput - The return type for the congestionForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Tool to simulate fetching local population data
const getRegionPopulationTool = ai.defineTool(
  {
    name: 'getRegionPopulationTool',
    description: 'Simulates fetching estimated population for a given Korean region (e.g., "서울특별시 강남구").',
    inputSchema: z.object({
      region: z.string().describe('The full region name including municipality, e.g., "서울특별시 강남구".'),
    }),
    outputSchema: z.object({
      population: z.number().describe('Estimated population of the region.'),
    }),
  },
  async ({ region }) => {
    // Simulate population based on keywords. This is a very rough estimation.
    // In a real scenario, this would query a database or an external API.
    let population = 50000; // Default small city/district
    if (region.includes('서울') || region.includes('부산') || region.includes('인천') || region.includes('대구') || region.includes('광주') || region.includes('대전') || region.includes('울산')) {
      population = 300000; // Larger metropolitan city district
      if (region.includes('강남') || region.includes('서초') || region.includes('송파')) population = 500000;
      if (region.includes('해운대')) population = 400000;
    } else if (region.includes('수원') || region.includes('성남') || region.includes('고양') || region.includes('용인')) {
      population = 200000; // Large city
    } else if (region.includes('군') || region.includes('면')) {
      population = 20000; // Rural area
    }
    // Add some randomness
    population = Math.floor(population * (0.8 + Math.random() * 0.4));
    return { population };
  }
);


const CongestionForecastInputSchema = z.object({
  date: z.string().describe('축제 시작일 (YYYY-MM-DD).'),
  duration: z.number().describe('축제 진행 기간 (일).'),
  frequency: z.number().describe('축제 진행 횟수 (연 단위).'),
  festivalType: z.string().describe('축제 종류 (예: 문화관광, 지역특산물).'),
  posterDataUri: z.string().describe("업로드된 행사 포스터 이미지의 데이터 URI. 형식: 'data:<mimetype>;base64,<encoded_data>'."),
  slogan: z.string().describe('축제 슬로건 텍스트.'),
  region: z.string().describe('축제 개최 지역 (광역자치단체 + 기초자치단체, 예: "서울특별시 강남구").'),
});
export type CongestionForecastInput = z.infer<typeof CongestionForecastInputSchema>;

const CongestionForecastOutputSchema = z.object({
  posterScore: z.number().min(0).max(100).describe('AI가 분석한 행사 포스터의 매력도 점수 (0-100점).'),
  totalExpectedVisitors: z.number().describe('예상되는 총 방문객 수.'),
  localVisitors: z.number().describe('예상되는 현지인 방문객 수.'),
  externalVisitors: z.number().describe('예상되는 외지인(관광객) 방문객 수.'),
  analysisReasoning: z.string().describe('방문객 수 예측에 대한 AI의 분석 근거 및 설명.')
});
export type CongestionForecastOutput = z.infer<typeof CongestionForecastOutputSchema>;

export async function congestionForecast(input: CongestionForecastInput): Promise<CongestionForecastOutput> {
  return congestionForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'congestionForecastPrompt',
  input: { schema: CongestionForecastInputSchema.extend({ estimatedLocalPopulation: z.number() }) }, // Add population here
  output: { schema: CongestionForecastOutputSchema },
  tools: [getRegionPopulationTool], // Make tool available
  prompt: `You are an AI expert specializing in forecasting festival attendance and evaluating promotional materials. Your responses must be in Korean.

  You will receive details about an upcoming festival: date, duration, frequency, type, poster image, slogan, and region.
  First, use the 'getRegionPopulationTool' to get the estimated population for the 'region' provided in the input.

  Based on all this information, including the estimated local population ({{{estimatedLocalPopulation}}}), perform the following:
  1.  Analyze the provided festival poster ({{media url=posterDataUri}}) and slogan ("{{{slogan}}}") for its attractiveness, clarity, and appeal. Assign a 'posterScore' between 0 and 100. A higher score indicates a more effective poster and slogan.
  2.  Estimate the 'totalExpectedVisitors' for the festival.
  3.  Break down the total visitors into 'localVisitors' (residents from the immediate region) and 'externalVisitors' (tourists from other areas).
  4.  Provide a brief 'analysisReasoning' in Korean explaining the key factors that influenced your visitor predictions and poster score. Consider festival type, duration, frequency, regional characteristics (like population), poster quality, and slogan impact.

  Festival Details:
  - 개최 지역: {{{region}}} (예상 인구: {{{estimatedLocalPopulation}}})
  - 축제 시작일: {{{date}}}
  - 진행 기간: {{{duration}}}일
  - 연간 진행 횟수: {{{frequency}}}회
  - 축제 종류: {{{festivalType}}}
  - 축제 슬로건: "{{{slogan}}}"
  - 행사 포스터: {{media url=posterDataUri}}

  Ensure your output strictly follows the JSON schema, providing all fields: 'posterScore', 'totalExpectedVisitors', 'localVisitors', 'externalVisitors', and 'analysisReasoning'. All text in 'analysisReasoning' must be in Korean.
  Be realistic with visitor numbers based on the inputs. A small local festival will have fewer visitors than a major regional one.
  `,
});

const congestionForecastFlow = ai.defineFlow(
  {
    name: 'congestionForecastFlow',
    inputSchema: CongestionForecastInputSchema,
    outputSchema: CongestionForecastOutputSchema,
  },
  async (input) => {
    // Call the tool to get population first
    const populationData = await getRegionPopulationTool({ region: input.region });
    const estimatedLocalPopulation = populationData.population;

    // Now call the main prompt with the enriched input
    const {output} = await prompt({ ...input, estimatedLocalPopulation });
    if (!output) {
      throw new Error("AI did not return an output for congestion forecast.");
    }
    return output;
  }
);
