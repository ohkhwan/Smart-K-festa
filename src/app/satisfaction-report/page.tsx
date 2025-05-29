
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, CartesianGrid, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { 
  FileText, Users, BarChartHorizontalBig, TrendingUp, Smile, ThumbsUp, MessageCircleHeart, Star,
  ClipboardList, CircleDollarSign, Footprints, Share2, Award, ShieldAlert, Trophy, CalendarClock, Newspaper, Instagram, Twitter, Facebook
} from 'lucide-react';

const generateRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomDistribution = (count: number, total: number): number[] => {
  let currentTotal = 0;
  const values = [];
  for (let i = 0; i < count - 1; i++) {
    const value = generateRandomNumber(1, Math.floor((total - currentTotal) / (count - i -1 )) + 1 );
    values.push(value);
    currentTotal += value;
  }
  values.push(Math.max(0, total - currentTotal)); // Ensure last value makes sum to total and is not negative
  
  // Shuffle to make it more random-like
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
};

const generatePercentageDistribution = (count: number): number[] => {
    const values = Array.from({ length: count }, () => Math.random());
    const sum = values.reduce((a, b) => a + b, 0);
    return values.map(v => Math.round((v / sum) * 100));
};


const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const SATISFACTION_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']; // green, lime, yellow, orange, red

const chartConfigBase = {
  visitors: { label: "방문객 수", color: "hsl(var(--chart-1))" },
  gender: { label: "성별", color: "hsl(var(--chart-2))" },
  age: { label: "연령대", color: "hsl(var(--chart-3))" },
  region: { label: "지역", color: "hsl(var(--chart-4))" },
  visitLength: { label: "방문일수", color: "hsl(var(--chart-5))" },
  accidents: { label: "사고 건수", color: "hsl(var(--destructive))"},
  news: { label: "뉴스 언급", color: "hsl(var(--chart-1))"},
  instagram: { label: "Instagram", color: "hsl(var(--chart-2))"},
  twitter: { label: "X (Twitter)", color: "hsl(var(--chart-3))"},
  facebook: { label: "Facebook", color: "hsl(var(--chart-4))"},
};

const 만족도항목 = ['매우 만족', '만족', '보통', '불만', '매우 불만'];
const 재방문의사항목 = ['재방문 의향 있음', '재방문 의향 없음'];
const 프로그램목록 = ['메인 공연', '전통 문화 체험', '지역 특산물 장터', '야간 퍼레이드', '어린이 놀이존'];
const 매출항목 = ['입장권', '음식 및 음료', '체험 프로그램', '상품 판매', '기타'];


export default function SatisfactionReportPage() {
  const surveyRespondents = React.useMemo(() => generateRandomNumber(350, 1200), []);

  const dailyVisitorData = React.useMemo(() => [
    { name: '1일차', visitors: generateRandomNumber(1500, 2500) },
    { name: '2일차', visitors: generateRandomNumber(2000, 3000) },
    { name: '3일차', visitors: generateRandomNumber(2200, 3500) },
    { name: '4일차', visitors: generateRandomNumber(1800, 2800) },
    { name: '5일차', visitors: generateRandomNumber(2500, 4000) },
  ], []);
  
  const hourlyVisitorData = React.useMemo(() => Array.from({length: 12}, (_, i) => ({
      name: `${9+i}:00`, 
      visitors: generateRandomNumber(100 + i*20, 300 + i*50)
  })), []);

  const genderDist = React.useMemo(() => generatePercentageDistribution(2), []);
  const genderData = React.useMemo(() => [
    { name: '남성', value: genderDist[0] },
    { name: '여성', value: genderDist[1] },
  ], [genderDist]);

  const ageDist = React.useMemo(() => generatePercentageDistribution(5), []);
  const ageData = React.useMemo(() => [
    { name: '10대', value: ageDist[0] },
    { name: '20대', value: ageDist[1] },
    { name: '30대', value: ageDist[2] },
    { name: '40대', value: ageDist[3] },
    { name: '50대+', value: ageDist[4] },
  ].sort((a,b) => b.value - a.value), [ageDist]);
  
  const regionDist = React.useMemo(() => generatePercentageDistribution(2), []);
  const regionData = React.useMemo(() => [
    { name: '현지인', value: regionDist[0] },
    { name: '외지인', value: regionDist[1] },
  ], [regionDist]);

  const visitLengthDist = React.useMemo(() => generatePercentageDistribution(3), []);
  const visitLengthData = React.useMemo(() => [
    { name: '당일', value: visitLengthDist[0] },
    { name: '1박 2일', value: visitLengthDist[1] },
    { name: '2박 이상', value: visitLengthDist[2] },
  ].sort((a,b) => b.value - a.value), [visitLengthDist]);

  const overallSatisfactionDist = React.useMemo(() => generatePercentageDistribution(5), []);
  const overallSatisfactionData = React.useMemo(() => 만족도항목.map((name, index) => ({
    name, value: overallSatisfactionDist[index]
  })), [overallSatisfactionDist]);

  const revisitIntentionDist = React.useMemo(() => generatePercentageDistribution(2), []);
  const revisitIntentionData = React.useMemo(() => [
    { name: '재방문 의향 있음', value: revisitIntentionDist[0] },
    { name: '재방문 의향 없음', value: revisitIntentionDist[1] },
  ], [revisitIntentionDist]);

  const satisfyingProgramsDist = React.useMemo(() => generatePercentageDistribution(5).sort((a,b) => b-a), []);
  const satisfyingProgramsData = React.useMemo(() => 프로그램목록.map((name, index) => ({
    name, value: satisfyingProgramsDist[index]
  })).sort((a,b) => b.value - a.value), [satisfyingProgramsDist]);

  const totalRevenue = React.useMemo(() => generateRandomNumber(50000000, 250000000), []);
  const revenueBreakdownDist = React.useMemo(() => generatePercentageDistribution(매출항목.length), []);
  const revenueBreakdownData = React.useMemo(() => 매출항목.map((name, index) => ({
    name, value: revenueBreakdownDist[index]
  })).sort((a,b) => b.value - a.value), [revenueBreakdownDist]);

  const dailyAccidentData = React.useMemo(() => dailyVisitorData.map(d => ({
    name: d.name, accidents: generateRandomNumber(0,3)
  })), [dailyVisitorData]);

  const internetMentionData = React.useMemo(() => dailyVisitorData.map(d => ({
    name: d.name,
    news: generateRandomNumber(1,10),
    instagram: generateRandomNumber(20,150),
    twitter: generateRandomNumber(10,80),
    facebook: generateRandomNumber(5,50),
  })), [dailyVisitorData]);

  // Calculate scores for 종합평가
  const surveyScore = React.useMemo(() => {
    const positiveScore = (overallSatisfactionData.find(d => d.name === '매우 만족')?.value || 0) * 1 +
                          (overallSatisfactionData.find(d => d.name === '만족')?.value || 0) * 0.7;
    const revisitScore = (revisitIntentionData.find(d => d.name === '재방문 의향 있음')?.value || 0) * 1;
    return ((positiveScore / 100 * 6) + (revisitScore / 100 * 4)).toFixed(1); // Weighted average, scale to 10
  }, [overallSatisfactionData, revisitIntentionData]);

  const consumptionScore = React.useMemo(() => (totalRevenue / 250000000 * 8 + 2).toFixed(1), [totalRevenue]); // Simple scale based on max potential revenue

  const visitSafetyScore = React.useMemo(() => {
    const totalAccidents = dailyAccidentData.reduce((sum, day) => sum + day.accidents, 0);
    const score = Math.max(0, 10 - totalAccidents * 0.5); // Higher accidents, lower score
    return score.toFixed(1);
  }, [dailyAccidentData]);

  const internetBuzzScore = React.useMemo(() => {
    const totalMentions = internetMentionData.reduce((sum, day) => sum + day.instagram + day.twitter + day.facebook + day.news * 5, 0);
    const score = Math.min(10, (totalMentions / (dailyVisitorData.length * (150+80+50+10*5)) * 8 + 2)); // Normalize and scale
    return score.toFixed(1);
  }, [internetMentionData, dailyVisitorData.length]);
  
  const evaluationScorecard = [
      { category: '설문조사 지표', score: `${surveyScore}/10`, basis: `응답자 ${surveyRespondents}명 기준, 전반적 만족도 및 재방문 의사 반영`},
      { category: '소비 데이터 지표', score: `${consumptionScore}/10`, basis: `총 매출액 ${totalRevenue.toLocaleString('ko-KR')}원 및 부문별 기여도 분석`},
      { category: '방문 데이터 및 안전 지표', score: `${visitSafetyScore}/10`, basis: `일별 방문객 추이 및 사고 발생 건수 ${dailyAccidentData.reduce((s,d)=>s+d.accidents,0)}건 고려`},
      { category: '인터넷 데이터 지표', score: `${internetBuzzScore}/10`, basis: `총 ${internetMentionData.reduce((s,d)=>s+d.news+d.instagram+d.twitter+d.facebook,0)}건 언급, 플랫폼별 반응 분석`},
  ];

  const overallSummary = React.useMemo(() => {
    let summary = `이번 축제는 총 ${surveyRespondents}명의 설문 응답을 바탕으로 분석한 결과, 전반적으로 ${surveyScore}점의 높은 만족도를 보였습니다. `;
    summary += `특히 '${satisfyingProgramsData[0].name}' 프로그램이 ${satisfyingProgramsData[0].value}%로 가장 높은 호응을 얻었으며, 재방문 의향 또한 ${revisitIntentionData.find(d=>d.name === '재방문 의향 있음')?.value || 0}%로 긍정적입니다. \n`;
    summary += `총 매출액은 ${totalRevenue.toLocaleString('ko-KR')}원을 기록하였으며, 이 중 '${revenueBreakdownData[0].name}' 부문이 ${revenueBreakdownData[0].value}%로 가장 큰 비중을 차지했습니다. 소비 데이터 지표는 ${consumptionScore}점으로 평가되었습니다. \n`;
    const totalAccidents = dailyAccidentData.reduce((sum, day) => sum + day.accidents, 0);
    summary += `축제 기간 총 방문객은 ${dailyVisitorData.reduce((sum, day) => sum + day.visitors, 0).toLocaleString('ko-KR')}명으로 집계되었으며, 일별 사고 발생 건수는 총 ${totalAccidents}건으로 방문객 안전 지표는 ${visitSafetyScore}점을 기록했습니다. `;
    summary += `인터넷 및 소셜 미디어에서는 총 ${internetMentionData.reduce((s,d)=>s+d.news+d.instagram+d.twitter+d.facebook,0)}건 언급되며 ${internetBuzzScore}점의 높은 관심도를 보였습니다. \n`;
    summary += `종합적으로, 방문객 만족도와 소비 활성화는 긍정적이었으나, 향후 '${satisfyingProgramsData[1].name}'과 같은 프로그램의 만족도를 더욱 높이고, 행사 기간 중 안전 관리에 지속적인 주의를 기울인다면 더욱 성공적인 축제로 발전할 것입니다.`;
    if (totalAccidents > dailyVisitorData.length) summary += ` 특히, 일 평균 1건 이상의 사고는 개선이 필요한 부분입니다.`
    return summary;
  }, [surveyRespondents, surveyScore, satisfyingProgramsData, revisitIntentionData, totalRevenue, revenueBreakdownData, consumptionScore, dailyVisitorData, dailyAccidentData, visitSafetyScore, internetMentionData, internetBuzzScore]);


  const PieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const outerLabelRadius = outerRadius + 15;
    const x2 = cx + outerLabelRadius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + outerLabelRadius * Math.sin(-midAngle * RADIAN);


    return (
      <>
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10}>
          {`${(percent * 100).toFixed(0)}%`}
        </text>
         <text x={x2} y={y2} fill="hsl(var(--foreground))" textAnchor={x2 > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
          {name} ({value.toLocaleString()})
        </text>
      </>
    );
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
         <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg shadow-md mb-4">
           <FileText className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-primary">축제 만족도 리포트</h1>
        <p className="text-lg text-muted-foreground mt-2">축제 결과 및 방문객 만족도에 대한 종합 분석입니다.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 종합 평가 Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="text-accent" /> 종합 평가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationScorecard.map(item => (
                <div key={item.category} className="p-3 bg-secondary/30 rounded-md">
                  <h4 className="font-semibold text-md text-primary">{item.category}</h4>
                  <p className="text-xl font-bold">{item.score}</p>
                  <p className="text-xs text-muted-foreground">{item.basis}</p>
                </div>
              ))}
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-1"><Star className="text-yellow-400 fill-yellow-400"/> AI 총평</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line p-3 bg-secondary/30 rounded-md">{overallSummary}</p>
            </div>
          </CardContent>
        </Card>

        {/* 설문조사 지표 Card */}
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardList /> 설문조사 지표</CardTitle>
                <CardDescription>총 {surveyRespondents.toLocaleString('ko-KR')}명 응답 기준</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* 인구통계 */}
                <section>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Users/> 방문자 인구통계</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: '성별 분포', data: genderData, configKey: 'gender' },
                            { title: '연령대 분포', data: ageData, configKey: 'age' },
                            { title: '거주 지역 분포', data: regionData, configKey: 'region' },
                            { title: '방문일수 분포', data: visitLengthData, configKey: 'visitLength' },
                        ].map(chart => (
                            <div key={chart.title} className="h-[220px]">
                                <p className="text-sm font-medium text-center mb-1">{chart.title}</p>
                                <ChartContainer config={chartConfigBase} className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={PieChartLabel}>
                                                {chart.data.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 만족도 및 재방문 */}
                <section>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Smile/> 전반적인 만족도</h3>
                            <div className="h-[250px]">
                                <ChartContainer config={chartConfigBase} className="w-full h-full">
                                    <BarChart data={overallSatisfactionData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                        <CartesianGrid horizontal={false} strokeDasharray="3 3"/>
                                        <XAxis type="number" hide/>
                                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} fontSize={10}/>
                                        <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {overallSatisfactionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index % SATISFACTION_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><ThumbsUp/> 재방문 의사</h3>
                             <div className="h-[250px]">
                                <ChartContainer config={chartConfigBase} className="w-full h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <RechartsTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={revisitIntentionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false} label={PieChartLabel}>
                                            {revisitIntentionData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 만족 프로그램 */}
                <section>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Trophy/> 만족 프로그램 TOP 5</h3>
                    <ul className="space-y-2">
                        {satisfyingProgramsData.map((program, index) => (
                            <li key={program.name} className="p-3 bg-secondary/30 rounded-md flex justify-between items-center">
                                <span className="font-medium"> {index+1}위. {program.name}</span>
                                <span className="text-primary font-semibold">{program.value}%</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </CardContent>
        </Card>
        
        {/* 소비 데이터 지표 Card */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CircleDollarSign/> 소비 데이터 지표</CardTitle>
                <CardDescription>총 매출액: {totalRevenue.toLocaleString('ko-KR')}원</CardDescription>
            </CardHeader>
            <CardContent>
                <h4 className="text-md font-semibold mb-2 text-center">부문별 매출 비중</h4>
                <div className="h-[300px]">
                    <ChartContainer config={chartConfigBase} className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Pie data={revenueBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={PieChartLabel}>
                                    {revenueBreakdownData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>

        {/* 방문 데이터 지표 Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Footprints /> 방문 데이터 지표</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-md font-semibold mb-2">일별 방문자 수</h3>
                <div className="h-[250px]">
                <ChartContainer config={chartConfigBase} className="w-full h-full">
                    <BarChart data={dailyVisitorData} margin={{top: 5, right: 5, left: -25, bottom: 5}}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
                    </BarChart>
                </ChartContainer>
                </div>
            </div>
            <div>
                <h3 className="text-md font-semibold mb-2">시간대별 방문자 수 (축제 기간 중 평균)</h3>
                <div className="h-[250px]">
                <ChartContainer config={chartConfigBase} className="w-full h-full">
                     <LineChart data={hourlyVisitorData} margin={{top: 5, right: 20, left: -25, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={1}/>
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10}/>
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} dot={{r:3}} />
                    </LineChart>
                </ChartContainer>
                </div>
            </div>
            <div>
                <h3 className="text-md font-semibold mb-2 flex items-center gap-1"><ShieldAlert className="text-destructive" /> 일별 사고 발생 건수</h3>
                <div className="h-[200px]">
                <ChartContainer config={chartConfigBase} className="w-full h-full">
                    <BarChart data={dailyAccidentData} margin={{top: 5, right: 5, left: -25, bottom: 5}}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false}/>
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                        <Bar dataKey="accidents" fill="var(--color-accidents)" radius={4} />
                    </BarChart>
                </ChartContainer>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* 인터넷 데이터 지표 Card */}
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Share2/> 인터넷 데이터 지표</CardTitle>
                <CardDescription>축제 관련 온라인 언급량 추이</CardDescription>
            </CardHeader>
            <CardContent>
                <h3 className="text-md font-semibold mb-2">일자별 언급 횟수</h3>
                <div className="h-[300px]">
                     <ChartContainer config={chartConfigBase} className="w-full h-full">
                        <LineChart data={internetMentionData} margin={{top:5, right:20, left:0, bottom:5}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10}/>
                            <YAxis tickLine={false} axisLine={false} fontSize={10}/>
                            <RechartsTooltip content={<ChartTooltipContent/>}/>
                            <RechartsLegend wrapperStyle={{fontSize:"10px"}}/>
                            <Line type="monotone" dataKey="news" name="뉴스" stroke="var(--color-news)" strokeWidth={2} dot={{r:2}}/>
                            <Line type="monotone" dataKey="instagram" name="Instagram" stroke="var(--color-instagram)" strokeWidth={2} dot={{r:2}}/>
                            <Line type="monotone" dataKey="twitter" name="X (Twitter)" stroke="var(--color-twitter)" strokeWidth={2} dot={{r:2}}/>
                            <Line type="monotone" dataKey="facebook" name="Facebook" stroke="var(--color-facebook)" strokeWidth={2} dot={{r:2}}/>
                        </LineChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
      </div>
       <footer className="w-full mt-12 py-6 text-center text-muted-foreground text-sm border-t">
        &copy; {new Date().getFullYear()} Localytics AI. 모든 권리 보유.
      </footer>
    </div>
  );
}
