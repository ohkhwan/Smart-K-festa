
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { regions, getMunicipalitiesForRegion, type Municipality } from '@/lib/korea-regions';
import { congestionForecastSchema, festivalTypes, type CongestionForecastFormValues, type CongestionForecastResults } from '../schemas';
import { getCongestionForecastAction } from '../actions'; // Import the server action

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { AnimatedSpinner } from '@/components/icons/AnimatedSpinner';
import { BarChart3, CalendarDays, Users, MapPin, Zap, Target } from 'lucide-react';

// Helper function to simulate fetching population
const getSimulatedPopulation = (region: string, municipality: string): string => {
  if (!region || !municipality) return "지역을 선택해주세요";

  let finalPopulation: number | null = null;
  if (region.includes('서울') || region.includes('부산') || region.includes('인천')) {
    finalPopulation = 300000 + Math.floor(Math.random() * 200000);
  }
  else if (region.includes('경기')) {
    finalPopulation = 150000 + Math.floor(Math.random() * 150000);
  }

  if (municipality.includes('구')) {
    if (region.includes('서울') || region.includes('부산') || region.includes('인천') || region.includes('대구') || region.includes('광주') || region.includes('대전') || region.includes('울산')) {
      const guEstimate = 200000 + Math.floor(Math.random() * 300000);
      finalPopulation = Math.max(finalPopulation ?? 0, guEstimate);
    }
  }
  else if (municipality.includes('군')) {
    if (finalPopulation === null) {
      finalPopulation = 20000 + Math.floor(Math.random() * 30000);
    }
  }

  if (finalPopulation === null) {
    return "선택하신 자치단체의 예상 인구수 정보가 제공되지 않습니다.";
  }
  return `${finalPopulation.toLocaleString('ko-KR')} 명 (예상치)`;
};


export default function CongestionForecastPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<CongestionForecastResults | null>(null);
  const [availableMunicipalities, setAvailableMunicipalities] = React.useState<Municipality[]>([]);
  const [estimatedPopulation, setEstimatedPopulation] = React.useState<string>('');
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);

  const form = useForm<CongestionForecastFormValues>({
    resolver: zodResolver(congestionForecastSchema),
    defaultValues: {
      date: undefined,
      festivalType: undefined,
      region: '',
      municipality: '',
      budget: '',
    },
  });

  React.useEffect(() => {
    setIsMounted(true);
    if (!form.getValues('date')) {
        form.setValue('date', new Date());
    }
  }, [form]);

  const watchedRegion = form.watch('region');
  const watchedMunicipality = form.watch('municipality');

  React.useEffect(() => {
    if (!isMounted) return; 
    if (watchedRegion) {
      const newMunicipalities = getMunicipalitiesForRegion(watchedRegion);
      setAvailableMunicipalities(newMunicipalities);
      const currentMunicipality = form.getValues('municipality');
      if (currentMunicipality && !newMunicipalities.find(m => m.value === currentMunicipality)) {
          form.setValue('municipality', '', { shouldValidate: true });
      }
    } else {
      setAvailableMunicipalities([]);
      form.setValue('municipality', '', { shouldValidate: true });
    }
  }, [watchedRegion, form, isMounted]); 

  React.useEffect(() => {
    if (!isMounted) return; 
    if (watchedRegion && watchedMunicipality) {
      const regionLabel = regions.find(r => r.value === watchedRegion)?.label || watchedRegion;
      const muniObj = availableMunicipalities.find(m => m.value === watchedMunicipality);
      const municipalityLabel = muniObj?.label || watchedMunicipality;
      setEstimatedPopulation(getSimulatedPopulation(regionLabel, municipalityLabel));
    } else {
      setEstimatedPopulation(watchedRegion ? '기초자치단체까지 선택 시 표시됩니다.' : '');
    }
  }, [watchedRegion, watchedMunicipality, isMounted, availableMunicipalities]);

  const onSubmit = async (data: CongestionForecastFormValues) => {
    setIsLoading(true);
    setResults(null);

    if (!data.date || !data.festivalType || !data.region || !data.municipality || !data.budget) {
        toast({ variant: "destructive", title: "오류", description: "모든 필수 입력값을 채워주세요." });
        setIsLoading(false);
        return;
    }
    
    try {
        const actionResult = await getCongestionForecastAction(data);

        if (actionResult.success && actionResult.data?.congestionForecast) {
          setResults(actionResult.data as CongestionForecastResults);
          toast({
            title: "방문객 예측 완료",
            description: "AI 예측 결과를 확인하세요.",
          });
        } else {
          throw new Error(actionResult.error || 'AI 방문객 예측 결과를 가져오는데 실패했습니다.');
        }
      }  catch (error) {
        const errorMessage = error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.';
        console.error('Submission error:', error);
        toast({
          variant: "destructive",
          title: "오류 발생",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 sm:p-6 md:p-8">
        <AnimatedSpinner className="h-12 w-12 text-primary" />
        <p className="mt-2 text-muted-foreground">페이지를 로딩 중입니다...</p>
      </div>
    );
  }

  return (
     <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 sm:p-6 md:p-8">
       <header className="w-full max-w-4xl mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg shadow-md mb-4">
           <BarChart3 className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-primary">AI 축제 방문객 예측</h1>
        <p className="text-lg text-muted-foreground mt-2">AI를 통해 축제 예상 방문객 정보를 분석합니다.</p>
      </header>

      <main className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Zap className="text-accent" />예측 정보 입력</CardTitle>
            <CardDescription>AI 방문객 예측을 위한 축제 정보를 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><MapPin size={16} /> 광역자치단체</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('municipality', '', { shouldValidate: true });
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="광역자치단체를 선택하세요" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="municipality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><MapPin size={16} /> 기초자치단체 / 시/군/구</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!watchedRegion || availableMunicipalities.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder={watchedRegion ? "기초자치단체를 선택하세요" : "광역자치단체를 먼저 선택하세요"} /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMunicipalities.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        {estimatedPopulation && <FormDescription className="mt-1 text-sm text-primary">{estimatedPopulation}</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  
                </div>
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>예산 (백만원)</FormLabel>
                      <FormControl><Input type="text" placeholder="예: 50 (5천만원에 해당)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-1"><CalendarDays size={16} /> 축제 시작일</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                              {field.value ? format(field.value, "PPP", { locale: ko }) : <span>날짜를 선택하세요</span>}
                              <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ko} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="festivalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>축제 종류</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="축제 종류를 선택하세요" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {festivalTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (<><AnimatedSpinner className="mr-2 h-4 w-4" /> 예측 중...</>) : 'AI 방문객 예측 시작'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-8 text-center">
            <AnimatedSpinner className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 text-muted-foreground">AI가 방문객을 예측 중입니다. 잠시만 기다려주세요...</p>
          </div>
        )}

        {results && !isLoading && results.congestionForecast && (
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="text-accent" /> AI 예측 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Users className="h-5 w-5" /> 예상 총 방문객 수</h3>
                <p className="text-3xl font-bold">{results.congestionForecast.totalExpectedVisitors.toLocaleString('ko-KR')} 명</p>
                <p className="text-xs text-muted-foreground mt-1">이 수치는 AI 모델에 의한 추정치이며, 실제 방문객 수와 다를 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
       <footer className="w-full max-w-4xl mt-12 py-6 text-center text-muted-foreground text-sm border-t">
        &copy; {new Date().getFullYear()} Localytics AI. 모든 권리 보유.
      </footer>
    </div>
  );
}
