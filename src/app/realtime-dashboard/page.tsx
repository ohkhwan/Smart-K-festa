
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, AlertTriangle, MessageSquare, MapPin, BarChartBig, CircleDollarSign, Map } from 'lucide-react'; // Added Map import
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import Image from 'next/image';

const generateRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface SocialPost {
  id: number;
  platform: 'Instagram' | 'X' | 'Facebook';
  user: string;
  text: string;
  likes: number;
  timestamp: string;
}

const initialSocialPosts: SocialPost[] = [
  { id: 1, platform: 'Instagram', user: 'festival_lover', text: '여기 너무 신나요! #축제 #꿀잼', likes: generateRandomNumber(50,200), timestamp: '방금 전'},
  { id: 2, platform: 'X', user: 'travelholic', text: '오늘 날씨도 좋고 축제 분위기 최고!', likes: generateRandomNumber(30,150), timestamp: '2분 전'},
  { id: 3, platform: 'Facebook', user: '김철수', text: '가족들이랑 왔는데 아이들이 너무 좋아하네요 ^^', likes: generateRandomNumber(20,100), timestamp: '5분 전'},
];

const congestionColors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500']; // low, medium, high

export default function RealtimeDashboardPage() {
  const [totalVisitors, setTotalVisitors] = React.useState(generateRandomNumber(500, 1000));
  const [localVisitors, setLocalVisitors] = React.useState(Math.floor(totalVisitors * 0.6));
  const [externalVisitors, setExternalVisitors] = React.useState(totalVisitors - Math.floor(totalVisitors * 0.6));

  const [ticketSales, setTicketSales] = React.useState(generateRandomNumber(1000000, 5000000));
  const [merchandiseSales, setMerchandiseSales] = React.useState(generateRandomNumber(500000, 3000000));
  const [foodSales, setFoodSales] = React.useState(generateRandomNumber(2000000, 8000000));
  const [experienceSales, setExperienceSales] = React.useState(generateRandomNumber(300000, 2000000));
  
  const [socialPosts, setSocialPosts] = React.useState<SocialPost[]>(initialSocialPosts);
  const [congestionGrid, setCongestionGrid] = React.useState<number[][]>(
    Array(5).fill(null).map(() => Array(5).fill(null).map(() => generateRandomNumber(0,2)))
  );
  const [safetyAlert, setSafetyAlert] = React.useState<string | null>(null);
  const [movingDots, setMovingDots] = React.useState<{id: number, x: number, y: number}[]>(
      Array(10).fill(null).map((_,i) => ({id: i, x: Math.random() * 90 + 5, y: Math.random() * 90 + 5}))
  );

  const [socialTrendData, setSocialTrendData] = React.useState(
    Array.from({length: 10}, (_,i) => ({name: `T-${9-i}`, posts: generateRandomNumber(5, 30)}))
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate visitor increase
      const newVisitors = generateRandomNumber(5, 20);
      setTotalVisitors(prev => prev + newVisitors);
      setLocalVisitors(prev => Math.floor((prev/totalVisitors) * (totalVisitors + newVisitors)) + generateRandomNumber(1,Math.floor(newVisitors/2)) );
      setExternalVisitors(prev => (totalVisitors + newVisitors) - (Math.floor((localVisitors/totalVisitors) * (totalVisitors + newVisitors)) + generateRandomNumber(1,Math.floor(newVisitors/2))) );


      // Simulate sales increase
      setTicketSales(prev => prev + generateRandomNumber(10000, 50000));
      setMerchandiseSales(prev => prev + generateRandomNumber(5000, 30000));
      setFoodSales(prev => prev + generateRandomNumber(20000, 80000));
      setExperienceSales(prev => prev + generateRandomNumber(3000, 20000));

      // Simulate new social post
      if (Math.random() < 0.3) {
        const newPost: SocialPost = {
          id: Date.now(),
          platform: ['Instagram', 'X', 'Facebook'][generateRandomNumber(0,2)] as 'Instagram' | 'X' | 'Facebook',
          user: `user_${generateRandomNumber(100,999)}`,
          text: `새로운 축제 후기! 정말 ${['최고예요', '재밌어요', '추천합니다'][generateRandomNumber(0,2)]} #축제라이브`,
          likes: generateRandomNumber(1,50),
          timestamp: '방금 전'
        };
        setSocialPosts(prev => [newPost, ...prev.slice(0,4)]);
        setSocialTrendData(prev => [...prev.slice(1), {name: 'Now', posts: Math.max(0, prev[prev.length-1].posts + generateRandomNumber(-2,5)) }])
      }
      
      // Simulate congestion change
      setCongestionGrid(prev => prev.map(row => row.map(() => generateRandomNumber(0,2))));
      
      // Simulate safety alert
      const highCongestionZones = congestionGrid.flat().filter(c => c === 2).length;
      if (highCongestionZones > 8 && Math.random() > 0.7) { // 8 zones are red
        setSafetyAlert(`주의: ${['A구역', 'B구역', '중앙무대 앞'][generateRandomNumber(0,2)]} 혼잡도 매우 높음. 안전 요원 추가 배치 필요.`);
      } else if (Math.random() < 0.05) { // Small chance of random alert
        setSafetyAlert(`경고: ${['응급 환자 발생 (C구역)', '분실물 신고 접수 (안내센터)'][generateRandomNumber(0,1)]}. 확인 바랍니다.`);
      } else if (safetyAlert && Math.random() > 0.5) {
        setSafetyAlert(null); // Clear alert sometimes
      }

      // Simulate moving dots
      setMovingDots(prevDots => prevDots.map(dot => ({
        ...dot,
        x: Math.max(5, Math.min(95, dot.x + (Math.random() - 0.5) * 5)),
        y: Math.max(5, Math.min(95, dot.y + (Math.random() - 0.5) * 5)),
      })));

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalVisitors, safetyAlert, congestionGrid, localVisitors]);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg shadow-md mb-4">
           <Map className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-primary">실시간 축제 현황분석</h1>
        <p className="text-lg text-muted-foreground mt-2">축제 현장의 데이터를 실시간으로 모니터링합니다.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users /> 방문객 현황</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>총 방문객: <span className="font-bold text-lg">{totalVisitors.toLocaleString()}</span> 명</p>
              <Progress value={(totalVisitors % 10000) / 100} className="h-2" />
              <p>현지인: <span className="font-bold">{localVisitors.toLocaleString()}</span> 명</p>
              <p>외지인: <span className="font-bold">{externalVisitors.toLocaleString()}</span> 명</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CircleDollarSign/> 예상 매출액</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>입장료: {ticketSales.toLocaleString()} 원</p>
              <p>상품 판매: {merchandiseSales.toLocaleString()} 원</p>
              <p>음식 판매: {foodSales.toLocaleString()} 원</p>
              <p>체험 프로그램: {experienceSales.toLocaleString()} 원</p>
              <p className="font-bold pt-2 border-t mt-2">총 매출: {(ticketSales + merchandiseSales + foodSales + experienceSales).toLocaleString()} 원</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Map and Congestion */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> 행사장 혼잡도 및 안전</CardTitle></CardHeader>
            <CardContent>
              <div className="relative w-full aspect-square bg-gray-200 rounded-md overflow-hidden border">
                {/* Placeholder for a map image - replace with actual map if needed */}
                <Image src="https://placehold.co/400x400.png?text=Festival+Map+Area" alt="행사장 지도" layout="fill" objectFit="cover" data-ai-hint="map aerial" />
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-px">
                  {congestionGrid.flat().map((level, index) => (
                    <div key={index} className={`opacity-50 ${congestionColors[level]}`} />
                  ))}
                </div>
                {movingDots.map(dot => (
                    <div key={dot.id} className="absolute w-2 h-2 bg-red-600 rounded-full opacity-75" style={{left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)'}}/>
                ))}
              </div>
              {safetyAlert && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>안전 경고!</AlertTitle>
                  <AlertDescription>{safetyAlert}</AlertDescription>
                </Alert>
              )}
               <div className="mt-2 text-xs">
                <span className="inline-block w-3 h-3 bg-green-500 mr-1 rounded-sm"></span> 원활
                <span className="inline-block w-3 h-3 bg-yellow-500 ml-2 mr-1 rounded-sm"></span> 보통
                <span className="inline-block w-3 h-3 bg-red-500 ml-2 mr-1 rounded-sm"></span> 혼잡
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Social Media */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare /> 소셜 미디어 반응</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[150px] mb-4">
                <ChartContainer config={{posts: {label: "게시물 수", color: "hsl(var(--primary))"}}} className="w-full h-full">
                    <LineChart data={socialTrendData} margin={{top:5, right: 10, left: -25, bottom:0}} >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10}/>
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
                        <Line dataKey="posts" type="monotone" stroke="var(--color-posts)" strokeWidth={2} dot={false}/>
                    </LineChart>
                </ChartContainer>
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {socialPosts.map(post => (
                  <div key={post.id} className="text-xs p-2 border rounded-md bg-secondary/30">
                    <p><span className="font-semibold">{post.user}</span> ({post.platform}) - <span className="text-muted-foreground">{post.timestamp}</span></p>
                    <p>{post.text}</p>
                    <p className="text-right text-primary">좋아요 {post.likes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChartBig /> 주요 지표 (가상)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p>평균 체류 시간: {generateRandomNumber(60, 180)}분</p>
                <p>재방문 의향률: {generateRandomNumber(60,95)}%</p>
                <p>실시간 만족도: {generateRandomNumber(70,98)}/100</p>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
