
'use server';
/**
 * @fileOverview A festival congestion forecasting AI agent using LLM estimation.
 *
 * - congestionForecast - A function that handles the festival congestion forecast process.
 * - CongestionForecastInput - The input type for the congestionForecast function.
 * - CongestionForecastOutput - The return type for the congestionForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CongestionForecastInputSchema = z.object({
  regionName: z.string().describe('축제 개최 광역자치단체 (예: "서울특별시", "경기도").'),
  municipalityName: z.string().describe('축제 개최 기초자치단체 (예: "강남구", "수원시").'),
  dongName: z.string().optional().describe('축제 개최 읍/면/동 (선택 사항, 예: "역삼동").'),
  date: z.string().describe('축제 시작일 (YYYY-MM-DD).'),
  festivalType: z.string().describe('축제 종류 (예: 문화관광, 지역특산물, 체험).'),
  budget: z.number().describe('축제 예산 (백만원 단위).'),
});
export type CongestionForecastInput = z.infer<typeof CongestionForecastInputSchema>;

const CongestionForecastOutputSchema = z.object({
  totalExpectedVisitors: z.number().describe('예상되는 총 방문객 수.')
});
export type CongestionForecastOutput = z.infer<typeof CongestionForecastOutputSchema>;

export async function congestionForecast(input: CongestionForecastInput): Promise<CongestionForecastOutput> {
  return congestionForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'congestionForecastPrompt',
  input: { schema: CongestionForecastInputSchema },
  output: { schema: CongestionForecastOutputSchema },
  prompt: `You are an AI expert specializing in forecasting festival attendance in South Korea. Your responses must be in Korean.

  Based on the following festival details, estimate the 'totalExpectedVisitors'.
  Consider factors like:
  - Location: The combination of 'regionName', 'municipalityName', and 'dongName' (if provided) will give you a sense of population density and accessibility. For example, a festival in "서울특별시 강남구" will likely attract more visitors than one in a rural '면' if other factors are similar.
  - Date: Consider the time of year (seasonality) and day of the week if inferable (though only date is provided).
  - Festival Type: Some types of festivals (e.g., major cultural events, popular music festivals) naturally draw larger crowds than niche or local community events.
  - Budget: A larger budget often implies a larger scale festival with more marketing, potentially attracting more visitors.

  Festival Details:
  - 개최 광역단체: {{{regionName}}}
  - 개최 기초단체: {{{municipalityName}}}
  {{#if dongName}}
  - 개최 읍/면/동: {{{dongName}}}
  {{/if}}
  - 축제 시작일: {{{date}}}
  - 축제 종류: {{{festivalType}}}
  - 예산 (백만원): {{{budget}}}

  Provide your best estimate for 'totalExpectedVisitors'.
  Be realistic. A small local festival with a low budget will have far fewer visitors than a large, well-funded festival in a major city.
  Output only a JSON object matching the defined schema.
  `,
});

const congestionForecastFlow = ai.defineFlow(
  {
    name: 'congestionForecastFlow',
    inputSchema: CongestionForecastInputSchema,
    outputSchema: CongestionForecastOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI did not return an output for congestion forecast.");
    }
    // Add a small random factor to make results seem less deterministic for LLM estimations if needed
    // output.totalExpectedVisitors = Math.max(0, Math.floor(output.totalExpectedVisitors * (0.9 + Math.random() * 0.2)));
    return output;
  }
);
