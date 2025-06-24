# Smart K Festa - 축제 종합 컨설팅 서비스

## 1. 소개

Smart K Festa는 AI 기술을 활용하여 축제 기획, 운영, 분석에 필요한 다양한 정보를 제공하는 스마트 축제 종합 컨설팅 서비스입니다. 이 서비스는 지역별, 기간별 데이터를 통합 분석하여 최적의 축제 운영 방안을 제안하며, 실시간 방문객 예측과 만족도 리포트 등 다양한 기능을 통해 축제의 성공적인 개최를 지원합니다.

## 2. 주요 기능

### 1) 축제 만족도 리포트
- 사용자 피드백 및 설문 데이터를 분석하여 축제의 강점, 개선점, 참여자 특성, 만족도 평가 등을 종합 리포트로 제공합니다.
- 예시 코드: `src/app/satisfaction-report/page.tsx`

### 2) AI 방문객 예측
- AI 모델을 활용해 특정 지역·축제의 실시간/미래 방문객 수를 예측합니다.
- 위치, 시간, 과거 데이터를 입력받아 혼잡도와 방문객 변동을 분석합니다.
- 예측 페이지: https://github.com/okw5/smartkfestar1/tree/main

### 3) 예산 배분 및 기획 컨설팅
- 지역 데이터(민원, SNS 노출, 공공 관심도, 기후, 교통, 특산품 판매 등)를 통합 분석하여 AI 기반 예산 배분 및 기획 전략을 추천합니다.
- 최적의 테마, 행사 일정, 홍보 전략 등도 데이터 기반으로 제안합니다.

### 4) 인터랙티브 지도 및 지역 선택
- 지역별(시/군/구)로 축제 기획 및 분석이 가능하며, 지도 기반 인터페이스를 지원합니다.

## 3. 사용 기술

- **프론트엔드**: Next.js, React, Tailwind CSS
- **백엔드**: Node.js
- **AI/ML**: Genkit, Python 기반 모델 (예측 모델 등, 예: `model/축제데이터예측_F.ipynb`)
- **데이터 시각화**: Tremor
- **UI 컴포넌트**: Shadcn UI

## 4. 프로젝트 설정 및 실행

1. 저장소 클론 및 의존성 설치
   ```bash
   git clone https://github.com/ohkhwan/Smart-K-festa.git
   cd Smart-K-festa
   npm install
   ```

2. 개발 서버 실행
   ```bash
   npm run dev
   ```
   - 기본적으로 Next.js 기반으로 실행됩니다.

3. AI/ML 파이썬 모델 관련 의존성 설치
   ```bash
   pip install -r requirements.txt
   ```
   - 필요시 `model/` 디렉토리의 Jupyter Notebook을 통해 모델을 실행/테스트할 수 있습니다.

4. Docker 사용 시(선택)
   ```bash
   docker build -t smart-k-festa .
   docker run -p 3000:3000 smart-k-festa
   ```

## 5. 기타 안내

- 서비스의 UI/UX는 직관적이고 현대적인 레이아웃, 신뢰감을 주는 블루 계열 색상, 인터랙티브 지도와 데이터 시각화 아이콘(지도, 달력, 메가폰 등) 사용을 지향합니다.
- 프로젝트 설계 상세는 `docs/blueprint.md` 참고.

---

**Smart K Festa**는 데이터와 AI를 기반으로 한 혁신적인 축제 컨설팅 서비스를 제공합니다. 축제 기획부터 운영, 사후 분석까지 한 번에 해결하세요!
