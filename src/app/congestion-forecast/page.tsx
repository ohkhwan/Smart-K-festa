
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { regions, getMunicipalitiesForRegion, type Municipality } from '@/lib/korea-regions';
import { congestionForecastSchema, festivalTypes, type CongestionForecastFormValues, type CongestionForecastResults, type ActionResult } from '../schemas'; // Updated imports
import { getCongestionForecastAction } from '../actions';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { AnimatedSpinner } from '@/components/icons/AnimatedSpinner';
import { BarChart3, CalendarDays, Users, MapPin, ImageIcon, Zap, Target, Percent, User, Users2 } from 'lucide-react';
import Image from 'next/image';

// Helper function to simulate fetching population
const getSimulatedPopulation = (region: string, municipality: string): string => {
  if (!region || !municipality) return "지역을 선택해주세요";

  let finalPopulation: number | null = null;

  // Rule 1: Major metropolitan areas (광역)
  if (region.includes('서울') || region.includes('부산') || region.includes('인천')) {
    finalPopulation = 300000 + Math.floor(Math.random() * 200000);
  }
  // Rule 2: Gyeonggi-do (광역)
  else if (region.includes('경기')) {
    finalPopulation = 150000 + Math.floor(Math.random() * 150000);
  }

  // Rule 3: 'Gu' type municipality (기초) in major cities - can override or set if null
  if (municipality.includes('구')) {
    if (region.includes('서울') || region.includes('부산') || region.includes('인천') || region.includes('대구') || region.includes('광주') || region.includes('대전') || region.includes('울산')) {
      const guEstimate = 200000 + Math.floor(Math.random() * 300000);
      // If finalPopulation was null from regional rules, use guEstimate. Otherwise, take the max.
      // This ensures 'Gu' in a major city has a substantial population.
      finalPopulation = Math.max(finalPopulation ?? 0, guEstimate);
    }
  }
  // Rule 4: 'Gun' type municipality (기초), only if not a 'Gu' and no broader regional rule has set it.
  else if (municipality.includes('군')) {
    if (finalPopulation === null) { // Apply only if no specific regional population was determined yet
      finalPopulation = 20000 + Math.floor(Math.random() * 30000);
    }
  }

  // If after all specific rules, finalPopulation is still null, it means this combination
  // doesn't have a specific population estimate in our simulation.
  if (finalPopulation === null) {
    return "선택하신 자치단체의 예상 인구수 정보가 제공되지 않습니다.";
  }

  return `${finalPopulation.toLocaleString('ko-KR')} 명 (예상치)`;
};


export default function CongestionForecastPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<CongestionForecastResults | null>(null);
  const [availableMunicipalities, setAvailableMunicipalities] = React.useState<Municipality[]>([]);
  const [posterPreview, setPosterPreview] = React.useState<string | null>(null);
  const [posterFile, setPosterFile] = React.useState<File | null>(null);
  const [estimatedPopulation, setEstimatedPopulation] = React.useState<string>('');
  const { toast } = useToast();
  const [isMounted, setIsMounted] = React.useState(false);


  const form = useForm<CongestionForecastFormValues>({
    resolver: zodResolver(congestionForecastSchema),
    defaultValues: {
      date: undefined, // Initialize as undefined
      duration: 1,
      frequency: 1,
      festivalType: undefined,
      slogan: '',
      region: '',
      municipality: '',
    },
  });

  React.useEffect(() => {
    setIsMounted(true);
    // Set the date only on the client-side after mount
    if (!form.getValues('date')) { // Only set if not already set (e.g. by user interaction before mount)
        form.setValue('date', new Date());
    }
  }, [form]);

  const watchedRegion = form.watch('region');
  const watchedMunicipality = form.watch('municipality');

  // Effect to update available municipalities and reset municipality field when region changes
  React.useEffect(() => {
    if (!isMounted) return; 

    if (watchedRegion) {
      const newMunicipalities = getMunicipalitiesForRegion(watchedRegion);
      setAvailableMunicipalities(newMunicipalities);
      // If the currently selected municipality is not in the new list, reset it.
      // Also reset if the region itself changed.
      const currentMunicipality = form.getValues('municipality');
      if (currentMunicipality && !newMunicipalities.find(m => m.value === currentMunicipality)) {
          form.setValue('municipality', '', { shouldValidate: true });
      } else if (watchedRegion !== form.getValues('region') && currentMunicipality) {
          // This condition handles resetting if the region value itself changes, not just the list.
          // This part might be redundant if the above check is sufficient.
          // For safety, if a new region is selected, reset municipality.
      }
    } else {
      setAvailableMunicipalities([]);
      form.setValue('municipality', '', { shouldValidate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedRegion, form, isMounted]); // Removed form.getValues from deps, as it can cause issues

  // Effect to update estimated population when region or municipality changes
  React.useEffect(() => {
    if (!isMounted) return; 

    if (watchedRegion && watchedMunicipality) {
      const regionLabel = regions.find(r => r.value === watchedRegion)?.label || watchedRegion;
      // availableMunicipalities should be up-to-date from the previous effect
      const muniObj = availableMunicipalities.find(m => m.value === watchedMunicipality);
      const municipalityLabel = muniObj?.label || watchedMunicipality;
      setEstimatedPopulation(getSimulatedPopulation(regionLabel, municipalityLabel));
    } else {
      setEstimatedPopulation(watchedRegion ? '기초자치단체까지 선택 시 표시됩니다.' : '');
    }
  }, [watchedRegion, watchedMunicipality, isMounted, availableMunicipalities]);


  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "파일 크기 초과",
          description: "포스터 이미지 파일은 5MB를 초과할 수 없습니다.",
        });
        event.target.value = ''; // Clear the input
        setPosterFile(null);
        setPosterPreview(null);
        return;
      }
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPosterFile(null);
      setPosterPreview(null);
    }
  };

  const onSubmit = async (data: CongestionForecastFormValues) => {
    if (!posterFile) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "행사 포스터 이미지를 업로드해주세요.",
      });
      return;
    }
    setIsLoading(true);
    setResults(null);

    const reader = new FileReader();
    reader.readAsDataURL(posterFile);
    reader.onload = async () => {
        const posterDataUri = reader.result as string;
        try {
          const actionResult: ActionResult = await getCongestionForecastAction(data, posterDataUri);
          if (actionResult.success && actionResult.data?.congestionForecast) {
            setResults(actionResult.data as CongestionForecastResults);
            toast({
              title: "혼잡도 예측 완료",
              description: "AI 예측 결과를 확인하세요.",
            });
          } else {
            throw new Error(actionResult.error || 'AI 혼잡도 예측 결과를 가져오는데 실패했습니다.');
          }
        } catch (error) {
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
    reader.onerror = () => {
        toast({ variant: "destructive", title: "오류", description: "포스터 이미지 처리에 실패했습니다."});
        setIsLoading(false);
    };
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 sm:p-6 md:p-8">
        <AnimatedSpinner className="h-12 w-12 text-primary" />
        <p className="mt-2 text-muted-foreground">페이지를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg shadow-md mb-4">
           <BarChart3 className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-primary">AI 축제 혼잡도 예측</h1>
        <p className="text-lg text-muted-foreground mt-2">AI를 통해 축제 예상 방문객 및 포스터 효과를 분석합니다.</p>
      </header>

      <main className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><Zap className="text-accent" />예측 정보 입력</CardTitle>
            <CardDescription>AI 혼잡도 예측을 위한 축제 정보를 입력해주세요.</CardDescription>
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
                            // Reset municipality when region changes - handled by useEffect
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>진행 기간 (일)</FormLabel>
                        <FormControl><Input type="number" placeholder="예: 3" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연간 진행 횟수</FormLabel>
                        <FormControl><Input type="number" placeholder="예: 1" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)}/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                <FormField
                  control={form.control}
                  name="slogan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>축제 슬로건</FormLabel>
                      <FormControl><Textarea placeholder="축제 슬로건을 입력하세요 (예: 함께 즐기는 도심 속 가을 축제!)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><ImageIcon size={16}/> 행사 포스터 업로드 (5MB 이하)</FormLabel>
                  <FormControl><Input type="file" accept="image/*" onChange={handlePosterChange} /></FormControl>
                  {posterPreview && (
                    <div className="mt-2 relative w-full max-w-xs h-auto aspect-[3/4] border rounded-md overflow-hidden bg-gray-100">
                       <Image src={posterPreview} alt="포스터 미리보기" layout="fill" objectFit="contain" />
                    </div>
                  )}
                  <FormMessage>{!posterFile && form.formState.isSubmitted ? "포스터 이미지를 업로드해주세요." : ""}</FormMessage>
                </FormItem>

                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (<><AnimatedSpinner className="mr-2 h-4 w-4" /> 예측 중...</>) : 'AI 혼잡도 예측 시작'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-8 text-center">
            <AnimatedSpinner className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 text-muted-foreground">AI가 혼잡도를 예측 중입니다. 잠시만 기다려주세요...</p>
          </div>
        )}

        {results && !isLoading && results.congestionForecast && (
          <Card className="mt-8 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Target className="text-accent" /> AI 예측 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Percent className="h-5 w-5" /> 포스터 매력도 점수</h3>
                <p className="text-3xl font-bold">{results.congestionForecast.posterScore} / 100점</p>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Users className="h-5 w-5" /> 예상 총 방문객 수</h3>
                <p className="text-3xl font-bold">{results.congestionForecast.totalExpectedVisitors.toLocaleString('ko-KR')} 명</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-secondary/30">
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><User className="h-5 w-5" /> 예상 현지인 방문객</h3>
                  <p className="text-2xl font-bold">{results.congestionForecast.localVisitors.toLocaleString('ko-KR')} 명</p>
                </div>
                <div className="p-4 border rounded-lg bg-secondary/30">
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Users2 className="h-5 w-5" /> 예상 외지인 방문객</h3>
                  <p className="text-2xl font-bold">{results.congestionForecast.externalVisitors.toLocaleString('ko-KR')} 명</p>
                </div>
              </div>
               <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg text-primary">분석 근거</h3>
                <p className="mt-1 text-sm whitespace-pre-line">{results.congestionForecast.analysisReasoning}</p>
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
    

    

    

    