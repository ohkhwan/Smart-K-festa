# 스마트 관광 솔루션

## 1. 소개

본 프로젝트는 AI를 활용하여 관광 분야의 다양한 문제를 해결하는 스마트 관광 솔루션입니다. 주요 기능으로는 축제 만족도 분석 및 리포트와 실시간 혼잡도 예측이 있습니다.

## 2. 주요 기능

### 축제 만족도 리포트

사용자 피드백을 기반으로 축제 만족도를 분석하여 종합적인 리포트를 제공합니다. 이 리포트는 축제의 강점과 개선점, 참여자 분석, 만족도 평가 등을 포함합니다. `src/app/satisfaction-report/page.tsx` 파일에서 리포트 페이지의 구조와 일부 요약 내용을 확인할 수 있습니다.

### AI 방문객 예측

AI 모델을 사용하여 특정 지역 또는 이벤트의 실시간 및 미래 방문객 수를 예측합니다. 예측 모델은 위치, 시간, 과거 데이터 등을 입력받아 방문객 수준을 분석합니다. `src/ai/flows/congestion-forecast-flow.ts` 파일에서 방문객 예측 AI 모델의 입력 스키마를 확인할 수 있으며, `src/app/congestion-forecast/page.tsx` 파일에서 혼잡도 예측 페이지의 구조와 제목을 확인할 수 있습니다.

## 3. 사용 기술

* **프론트엔드**: Next.js, React, Tailwind CSS
* **백엔드**: Node.js
* **AI/ML**: Genkit
* **데이터 시각화**: Tremor
* **UI 컴포넌트**: Shadcn UI

## 4. 프로젝트 설정 및 실행

프로젝트를 로컬 환경에서 설정하고 실행하려면 다음 단계를 따르세요.
