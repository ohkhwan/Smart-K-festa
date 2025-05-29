
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  regions,
  getMunicipalitiesForRegion,
  type Municipality,
} from '@/lib/korea-regions';
import { festivalConsultingSchema, type FestivalConsultingFormValues, type FestivalConsultationResults, type ActionResult } from './schemas';
import { getFestivalConsultationAction } from './actions'; 
import type { HourlyWeatherForecast } from '@/ai/flows/festival-planning';


import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { AnimatedSpinner } from '@/components/icons/AnimatedSpinner';
import { 
  MapPin, CalendarDays, DollarSign, Megaphone, Lightbulb, Target, Cloud, Car, Clock, AlertTriangle, Route, Droplets, Thermometer
} from 'lucide-react';


export default function FestivalConsultingPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<FestivalConsultationResults | null>(null);
  const [selectedRegion, setSelectedRegion] = React.useState<string>('');
  const [availableMunicipalities, setAvailableMunicipalities] = React.useState<Municipality[]>([]);
  const { toast } = useToast();
  const [showFutureDateWarning, setShowFutureDateWarning] = React.useState(false);
  const [submittedDate, setSubmittedDate] = React.useState<Date | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);


  const form = useForm<FestivalConsultingFormValues>({
    resolver: zodResolver(festivalConsultingSchema),
    defaultValues: {
      region: '',
      municipality: '',
      budget: undefined,
      date: undefined, // Initialize as undefined
    },
  });

  React.useEffect(() => {
    setIsMounted(true);
    // Set the date only on the client-side after mount, if not already set
    if (!form.getValues('date')) {
        form.setValue('date', new Date(), { shouldValidate: true });
    }
  }, [form]);


  React.useEffect(() => {
    const regionValue = form.watch('region');
    if (regionValue) {
      const newMunicipalities = getMunicipalitiesForRegion(regionValue);
      setAvailableMunicipalities(newMunicipalities);
      if (regionValue !== selectedRegion) {
         form.resetField('municipality', { defaultValue: '' });
      }
      setSelectedRegion(regionValue);
    } else {
      setAvailableMunicipalities([]);
    }
  }, [form, form.watch('region'), selectedRegion]);


  const onSubmit = async (data: FestivalConsultingFormValues) => {
    setIsLoading(true);
    setResults(null);
    setSubmittedDate(data.date);

    try {
      const actionResult: ActionResult = await getFestivalConsultationAction(data);
      if (actionResult.success && actionResult.data?.festivalPlanning) {
        setResults(actionResult.data as FestivalConsultationResults);
        toast({
          title: "컨설팅 완료",
          description: "AI 추천 결과를 확인하세요.",
        });
      } else {
        throw new Error(actionResult.error || 'AI 컨설팅 결과를 가져오는데 실패했습니다.');
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

  const handleBudgetInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const numericValue = parseFloat(value.replace(/,/g, ''));
    if (!isNaN(numericValue)) {
      form.setValue('budget', numericValue, { shouldValidate: true });
      event.target.value = numericValue.toLocaleString('ko-KR');
    } else if (value === '') {
       form.setValue('budget', undefined as any, { shouldValidate: true });
       event.target.value = '';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    const newDate = date || new Date(); // Fallback to new Date() if undefined, though Calendar usually provides a date.
    form.setValue('date', newDate, { shouldValidate: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (differenceInDays(newDate, today) > 30) {
      setShowFutureDateWarning(true);
    } else {
      setShowFutureDateWarning(false);
    }
  };
  
  const isDateMoreThan30DaysInFuture = React.useMemo(() => {
    if (!submittedDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return differenceInDays(submittedDate, today) > 30;
  }, [submittedDate]);

  const generateHourlyForecastSummaryText = (forecasts: HourlyWeatherForecast[] | undefined): string => {
    if (!forecasts || forecasts.length === 0) {
      return "시간대별 예보 정보를 불러오지 못했습니다.";
    }
    // Display up to 3-4 key forecasts, e.g., morning, afternoon, evening
    const keyForecasts = forecasts.filter((_, index) => index === 0 || index === Math.floor(forecasts.length / 2) || index === forecasts.length - 1);
    
    const summary = keyForecasts
      .slice(0, 3) // Ensure we don't show too many even if filter yields more
      .map(f => `${f.time} ${f.condition} (${f.temperature}°C, 강수 ${f.precipitationChance}%)`)
      .join(' / ');
    return summary + (forecasts.length > 3 ? ' 등 주요 시간대 예보입니다.' : '.');
  };

  if (!isMounted) {
    // Render a loading state or null while waiting for the client to mount
    // This helps prevent hydration mismatches for the date field
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
           <Lightbulb className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-primary">AI 축제 컨설팅</h1>
        <p className="text-lg text-muted-foreground mt-2">AI 기반 축제 기획 및 최적화 컨설팅</p>
      </header>

      <main className="w-full max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="text-accent" />
              컨설팅 정보 입력
            </CardTitle>
            <CardDescription>AI 축제 컨설팅을 위한 기본 정보를 입력해주세요.</CardDescription>
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
                            // setSelectedRegion and municipality reset is handled by useEffect
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="광역자치단체를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.value} value={region.value}>
                                {region.label}
                              </SelectItem>
                            ))}
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
                          value={field.value} // Ensure value is controlled
                          disabled={!selectedRegion || availableMunicipalities.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedRegion ? "기초자치단체를 선택하세요" : "광역자치단체를 먼저 선택하세요"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMunicipalities.map((muni) => (
                              <SelectItem key={muni.value} value={muni.value}>
                                {muni.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-1"><CalendarDays size={16} /> 기준 날짜</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ko })
                                ) : (
                                  <span>날짜를 선택하세요</span>
                                )}
                                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleDateSelect}
                              initialFocus
                              locale={ko}
                            />
                          </PopoverContent>
                        </Popover>
                        {showFutureDateWarning && (
                          <p className="mt-1 text-sm font-medium text-destructive flex items-center gap-1">
                            <AlertTriangle size={14} />
                            장기예보는 제공하지 않습니다. (30일 이내 날짜를 선택해주세요)
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field: { onChange, value, ...restField } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1"><DollarSign size={16} /> 축제 집행 예산 (원)</FormLabel>
                        <FormControl>
                           <Input
                            type="text"
                            placeholder="예산을 입력하세요 (예: 100,000,000)"
                            value={value === undefined ? '' : (typeof value === 'number' ? value.toLocaleString('ko-KR') : value)}
                            onChange={handleBudgetInputChange}
                            onBlur={(e) => {
                                const numericValue = parseFloat(e.target.value.replace(/,/g, ''));
                                if (!isNaN(numericValue)) {
                                    e.target.value = numericValue.toLocaleString('ko-KR');
                                } else if (e.target.value !== '') {
                                    form.setValue('budget', undefined as any, { shouldValidate: true });
                                    e.target.value = '';
                                }
                            }}
                            {...restField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading || (showFutureDateWarning && form.getValues('date') && differenceInDays(form.getValues('date'), new Date()) > 30)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (
                    <>
                      <AnimatedSpinner className="mr-2 h-4 w-4" /> 컨설팅 진행 중...
                    </>
                  ) : (
                    'AI 컨설팅 시작'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-8 text-center">
            <AnimatedSpinner className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 text-muted-foreground">AI가 분석 중입니다. 잠시만 기다려주세요...</p>
          </div>
        )}

        {results && !isLoading && results.festivalPlanning && (
          <div className="mt-8 space-y-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="text-accent" />
                   AI 축제 기획 컨설팅
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    추천 테마
                  </h3>
                  <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md">{results.festivalPlanning.themeSuggestion || "추천 테마 정보를 불러오지 못했습니다."}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    추천 날짜
                  </h3>
                  <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md">{results.festivalPlanning.dateRecommendation || "추천 날짜 정보를 불러오지 못했습니다."}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    일일 날씨 요약
                  </h3>
                  <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md">{results.festivalPlanning.dailyWeatherSummary || "날씨 요약 정보를 불러오지 못했습니다."}</p>
                </div>
                
                {isDateMoreThan30DaysInFuture ? (
                   <div className="mt-1 p-3 bg-secondary/30 rounded-md">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle size={14} className="text-destructive" />
                        선택하신 날짜가 30일 이후이므로 상세 시간대별 예보는 제공되지 않습니다. 일일 날씨 요약만 참고해주세요.
                      </p>
                   </div>
                ) : (
                  results.festivalPlanning.hourlyWeatherForecasts && results.festivalPlanning.hourlyWeatherForecasts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        시간대별 예보 요약
                      </h3>
                      <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md">
                        {generateHourlyForecastSummaryText(results.festivalPlanning.hourlyWeatherForecasts)}
                      </p>
                    </div>
                  )
                )}
                
                {typeof results.festivalPlanning.trafficCongestionScore === 'number' && (
                   <div>
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      예상 교통 혼잡도
                    </h3>
                    <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md">
                      기준일 교통 혼잡도는 <strong>{results.festivalPlanning.trafficCongestionScore}/10</strong> 수준으로 예상됩니다. (1: 원활, 10: 매우 혼잡)
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    추천 홍보 전략
                  </h3>
                  <p className="mt-1 text-sm p-3 bg-secondary/30 rounded-md whitespace-pre-line">{results.festivalPlanning.promotionStrategy || "추천 홍보 전략 정보를 불러오지 못했습니다."}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
       <footer className="w-full max-w-4xl mt-12 py-6 text-center text-muted-foreground text-sm border-t">
        &copy; {new Date().getFullYear()} Localytics AI. 모든 권리 보유.
      </footer>
    </div>
  );
}


    