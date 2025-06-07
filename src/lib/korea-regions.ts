
export interface Region {
  value: string;
  label: string;
}

export interface Municipality {
  value: string;
  label: string;
  dong?: string; // 대표 읍면동 (법정동 기준)
}

export const regions: Region[] = [
  { value: "서울", label: "서울특별시" },
  { value: "부산", label: "부산광역시" },
  { value: "대구", label: "대구광역시" },
  { value: "인천", label: "인천광역시" },
  { value: "광주", label: "광주광역시" },
  { value: "대전", label: "대전광역시" },
  { value: "울산", label: "울산광역시" },
  { value: "세종", label: "세종특별자치시" },
  { value: "경기", label: "경기도" },
  { value: "강원", label: "강원특별자치도" },
  { value: "충북", label: "충청북도" },
  { value: "충남", label: "충청남도" },
  { value: "전북", label: "전북특별자치도" },
  { value: "전남", label: "전라남도" },
  { value: "경북", label: "경상북도" },
  { value: "경남", label: "경상남도" },
  { value: "제주", label: "제주특별자치도" },
];

export const municipalities: { [key: string]: Municipality[] } = {
  서울: [
    { value: "종로구", label: "종로구", dong: "동숭동" }, { value: "중구", label: "중구", dong: "태평로" }, { value: "용산구", label: "용산구", dong: "이촌동" },
    { value: "성동구", label: "성동구", dong: "왕십리도선동" }, { value: "광진구", label: "광진구", dong: "능동" }, { value: "동대문구", label: "동대문구", dong: "제기동" },
    { value: "중랑구", label: "중랑구", dong: "망우동" }, { value: "성북구", label: "성북구", dong: "삼선동" }, { value: "강북구", label: "강북구", dong: "수유동" },
    { value: "도봉구", label: "도봉구", dong: "방학동" }, { value: "노원구", label: "노원구", dong: "공릉동" }, { value: "은평구", label: "은평구", dong: "진관동" },
    { value: "서대문구", label: "서대문구", dong: "신촌동" }, { value: "마포구", label: "마포구", dong: "서교동" }, { value: "양천구", label: "양천구", dong: "목동" },
    { value: "강서구", label: "강서구", dong: "가양동" }, { value: "구로구", label: "구로구", dong: "구로동" }, { value: "금천구", label: "금천구", dong: "시흥동" },
    { value: "영등포구", label: "영등포구", dong: "여의도동" }, { value: "동작구", label: "동작구", dong: "노량진동" }, { value: "관악구", label: "관악구", dong: "남현동" },
    { value: "서초구", label: "서초구", dong: "반포동" }, { value: "강남구", label: "강남구", dong: "역삼동" }, { value: "송파구", label: "송파구", dong: "방이동" },
  ],
  부산: [
    { value: "중구", label: "중구", dong: "중앙동" }, { value: "서구", label: "서구", dong: "암남동" }, { value: "동구", label: "동구", dong: "초량동" },
    { value: "영도구", label: "영도구", dong: "동삼동" }, { value: "부산진구", label: "부산진구", dong: "서면" }, { value: "동래구", label: "동래구", dong: "명륜동" },
    { value: "남구", label: "남구", dong: "대연동" }, { value: "북구", label: "북구", dong: "구포동" }, { value: "해운대구", label: "해운대구", dong: "중동" },
    { value: "사하구", label: "사하구", dong: "감천동" }, { value: "금정구", label: "금정구", dong: "장전동" }, { value: "강서구", label: "강서구", dong: "대저1동" },
    { value: "연제구", label: "연제구", dong: "연산동" }, { value: "수영구", label: "수영구", dong: "광안동" }, { value: "사상구", label: "사상구", dong: "삼락동" },
    { value: "기장군", label: "기장군", dong: "기장읍" },
  ],
  대구: [
    { value: "중구", label: "중구", dong: "동성로" }, { value: "동구", label: "동구", dong: "신암동" }, { value: "서구", label: "서구", dong: "평리동" },
    { value: "남구", label: "남구", dong: "대명동" }, { value: "북구", label: "북구", dong: "검단동" }, { value: "수성구", label: "수성구", dong: "두산동" },
    { value: "달서구", label: "달서구", dong: "두류동" }, { value: "달성군", label: "달성군", dong: "유가읍" }, { value: "군위군", label: "군위군", dong: "고로면"},
  ],
  인천: [
    { value: "중구", label: "중구", dong: "신포동" }, { value: "동구", label: "동구", dong: "송현동" }, { value: "미추홀구", label: "미추홀구", dong: "주안동" }, // 인천 남구 -> 미추홀구
    { value: "연수구", label: "연수구", dong: "송도동" }, { value: "남동구", label: "남동구", dong: "논현동" }, { value: "부평구", label: "부평구", dong: "부평동" },
    { value: "계양구", label: "계양구", dong: "목상동" }, { value: "서구", label: "서구", dong: "오류동" }, { value: "강화군", label: "강화군", dong: "강화읍" },
    { value: "옹진군", label: "옹진군", dong: "북도면" },
  ],
  광주: [
    { value: "동구", label: "동구", dong: "충장로" }, { value: "서구", label: "서구", dong: "치평동" }, { value: "남구", label: "남구", dong: "양림동" },
    { value: "북구", label: "북구", dong: "우산동" }, { value: "광산구", label: "광산구", dong: "월곡동" },
  ],
  대전: [
    { value: "동구", label: "동구", dong: "중앙로" }, { value: "중구", label: "중구", dong: "뿌리공원로" }, { value: "서구", label: "서구", dong: "갈마동" },
    { value: "유성구", label: "유성구", dong: "도룡동" }, { value: "대덕구", label: "대덕구", dong: "송촌동" },
  ],
  울산: [
    { value: "중구", label: "중구", dong: "태화동" }, { value: "남구", label: "남구", dong: "삼산동" }, { value: "동구", label: "동구", dong: "전하동" },
    { value: "북구", label: "북구", dong: "효문동" }, { value: "울주군", label: "울주군", dong: "삼남읍" },
  ],
  세종: [
    { value: "세종시", label: "세종시 전체", dong: "조치원읍" }, // 주석 데이터에 '세종' 또는 '세종시'로 된 군구가 여러개 있어, 대표값 하나로 통합
    { value: "조치원읍", label: "조치원읍", dong: "조치원읍" }, { value: "연기면", label: "연기면" }, { value: "연동면", label: "연동면" },
    { value: "부강면", label: "부강면" }, { value: "금남면", label: "금남면" }, { value: "장군면", label: "장군면" },
    { value: "연서면", label: "연서면" }, { value: "전의면", label: "전의면", dong: "전의면" }, { value: "전동면", label: "전동면" },
    { value: "소정면", label: "소정면" }, { value: "한솔동", label: "한솔동" }, { value: "새롬동", label: "새롬동" },
    { value: "도담동", label: "도담동" }, { value: "아름동", label: "아름동" }, { value: "종촌동", label: "종촌동" },
    { value: "고운동", label: "고운동" }, { value: "보람동", label: "보람동" }, { value: "대평동", label: "대평동" },
    { value: "소담동", label: "소담동" }, { value: "다정동", label: "다정동" }, { value: "해밀동", label: "해밀동" },
    { value: "반곡동", label: "반곡동" }, { value: "집현동", label: "집현동" }, { value: "합강동", label: "합강동" },
    { value: "나성동", label: "나성동" }, { value: "어진동", label: "어진동" },
  ],
  경기: [
    { value: "수원시", label: "수원시", dong: "팔달구" }, // 주석에 '수원'으로 된 군구가 여러개, 대표값 사용
    { value: "성남시", label: "성남시", dong: "수정구" }, // 주석에 '성남'으로 된 군구가 여러개, 대표값 사용
    { value: "의정부시", label: "의정부시", dong: "의정부동" },
    { value: "안양시", label: "안양시", dong: "만안구" }, // 주석에 '안양'으로 된 군구가 여러개, 대표값 사용
    { value: "부천시", label: "부천시", dong: "상동" }, { value: "광명시", label: "광명시", dong: "가학동" },
    { value: "평택시", label: "평택시", dong: "팽성읍" }, { value: "동두천시", label: "동두천시", dong: "생연동" }, { value: "안산시", label: "안산시", dong: "상록구" }, // 주석에 '안산'으로 된 군구가 여러개, 대표값 사용
    { value: "고양시", label: "고양시", dong: "덕양구" }, { value: "과천시", label: "과천시", dong: "막계동" }, { value: "구리시", label: "구리시", dong: "토평동" },
    { value: "남양주시", label: "남양주시", dong: "조안면" }, { value: "오산시", label: "오산시", dong: "오산동" }, { value: "시흥시", label: "시흥시", dong: "물왕동" },
    { value: "군포시", label: "군포시", dong: "산본동" }, { value: "의왕시", label: "의왕시", dong: "내손동" }, { value: "하남시", label: "하남시", dong: "덕풍동" },
    { value: "용인시", label: "용인시", dong: "처인구" }, // 주석에 '용인'으로 된 군구가 여러개, 대표값 사용
    { value: "파주시", label: "파주시", dong: "문산읍" }, { value: "이천시", label: "이천시", dong: "장호원읍" },
    { value: "안성시", label: "안성시", dong: "당왕동" }, { value: "김포시", label: "김포시", dong: "고촌읍" }, { value: "화성시", label: "화성시", dong: "전곡항" },
    { value: "광주시", label: "광주시", dong: "곤지암읍" }, { value: "양주시", label: "양주시", dong: "광적면" }, { value: "포천시", label: "포천시", dong: "영북면" },
    { value: "여주시", label: "여주시", dong: "능서면" }, { value: "연천군", label: "연천군", dong: "전곡읍" }, { value: "가평군", label: "가평군", dong: "달전리" },
    { value: "양평군", label: "양평군", dong: "용문면" }, // 경기도 양평군과 강원도 양평군 구분 필요, 여기서는 경기도로 가정
  ],
  강원: [
    { value: "춘천시", label: "춘천시", dong: "근화동" }, { value: "원주시", label: "원주시", dong: "판부면" }, { value: "강릉시", label: "강릉시", dong: "주문진읍" },
    { value: "동해시", label: "동해시", dong: "무릉동" }, { value: "태백시", label: "태백시", dong: "황지동" }, { value: "속초시", label: "속초시", dong: "교동" },
    { value: "삼척시", label: "삼척시", dong: "근덕면" }, { value: "홍천군", label: "홍천군", dong: "홍천읍" }, { value: "횡성군", label: "횡성군", dong: "횡성읍" },
    { value: "영월군", label: "영월군", dong: "영월읍" }, { value: "평창군", label: "평창군", dong: "봉평면" }, { value: "정선군", label: "정선군", dong: "정선읍" },
    { value: "철원군", label: "철원군", dong: "동송읍" }, { value: "화천군", label: "화천군", dong: "화천읍" }, { value: "양구군", label: "양구군", dong: "양구읍" },
    { value: "인제군", label: "인제군", dong: "북면" }, { value: "고성군", label: "고성군", dong: "현내면" }, { value: "양양군", label: "양양군", dong: "양양읍" },
  ],
  충북: [
    { value: "청주시", label: "청주시", dong: "상당구" }, { value: "충주시", label: "충주시", dong: "수안보면" }, { value: "제천시", label: "제천시", dong: "의림대로" },
    { value: "보은군", label: "보은군", dong: "보은읍" }, { value: "옥천군", label: "옥천군", dong: "군북면" }, { value: "영동군", label: "영동군", dong: "영동읍" },
    { value: "증평군", label: "증평군", dong: "증평읍" }, { value: "진천군", label: "진천군", dong: "문백면" }, { value: "괴산군", label: "괴산군", dong: "괴산읍" },
    { value: "음성군", label: "음성군", dong: "음성읍" }, { value: "단양군", label: "단양군", dong: "영춘면" },
  ],
  충남: [
    { value: "천안시", label: "천안시", dong: "서북구" }, { value: "공주시", label: "공주시", dong: "금흥동" }, { value: "보령시", label: "보령시", dong: "웅천읍" },
    { value: "아산시", label: "아산시", dong: "염치읍" }, { value: "서산시", label: "서산시", dong: "해미면" }, { value: "논산시", label: "논산시", dong: "연산면" },
    { value: "계룡시", label: "계룡시", dong: "신도안면" }, { value: "당진시", label: "당진시", dong: "송악읍" }, { value: "금산군", label: "금산군", dong: "금산읍" },
    { value: "부여군", label: "부여군", dong: "부여읍" }, { value: "서천군", label: "서천군", dong: "마서면" }, { value: "청양군", label: "청양군", dong: "정산면" },
    { value: "홍성군", label: "홍성군", dong: "서부면" }, { value: "예산군", label: "예산군", dong: "예산읍" }, { value: "태안군", label: "태안군", dong: "안면읍" },
  ],
  전북: [
    { value: "전주시", label: "전주시", dong: "완산구" }, // 주석에 '전주'로 된 군구가 여러개, 대표값 사용
    { value: "군산시", label: "군산시", dong: "월명동" }, { value: "익산시", label: "익산시", dong: "금마면" },
    { value: "정읍시", label: "정읍시", dong: "신태인읍" }, { value: "남원시", label: "남원시", dong: "운봉읍" }, { value: "김제시", label: "김제시", dong: "부량면" },
    { value: "완주군", label: "완주군", dong: "고산면" }, { value: "진안군", label: "진안군", dong: "진안읍" }, { value: "무주군", label: "무주군", dong: "무주읍" },
    { value: "장수군", label: "장수군", dong: "장수읍" }, { value: "임실군", label: "임실군", dong: "임실읍" }, { value: "순창군", label: "순창군", dong: "복흥면" },
    { value: "고창군", label: "고창군", dong: "고창읍" }, { value: "부안군", label: "부안군", dong: "줄포면" },
  ],
  전남: [
    { value: "목포시", label: "목포시", dong: "산정동" }, { value: "여수시", label: "여수시", dong: "종화동" }, { value: "순천시", label: "순천시", dong: "해룡면" },
    { value: "나주시", label: "나주시", dong: "영산동" }, { value: "광양시", label: "광양시", dong: "광양읍" }, { value: "담양군", label: "담양군", dong: "담양읍" },
    { value: "곡성군", label: "곡성군", dong: "오곡면" }, { value: "구례군", label: "구례군", dong: "구례읍" }, { value: "고흥군", label: "고흥군", dong: "도양읍" },
    { value: "보성군", label: "보성군", dong: "보성읍" }, { value: "화순군", label: "화순군", dong: "도곡면" }, { value: "장흥군", label: "장흥군", dong: "회진면" },
    { value: "강진군", label: "강진군", dong: "강진읍" }, { value: "해남군", label: "해남군", dong: "송지면" }, { value: "영암군", label: "영암군", dong: "군서면" },
    { value: "무안군", label: "무안군", dong: "해제면" }, { value: "함평군", label: "함평군", dong: "함평읍" }, { value: "영광군", label: "영광군", dong: "법성면" },
    { value: "장성군", label: "장성군", dong: "장성읍" }, { value: "완도군", label: "완도군", dong: "완도읍" }, { value: "진도군", label: "진도군", dong: "진도읍" },
    { value: "신안군", label: "신안군", dong: "도초면" },
  ],
  경북: [
    { value: "포항시", label: "포항시", dong: "남구" }, { value: "경주시", label: "경주시", dong: "보문동" }, { value: "김천시", label: "김천시", dong: "대항면" },
    { value: "안동시", label: "안동시", dong: "남후면" }, { value: "구미시", label: "구미시", dong: "송정동" }, { value: "영주시", label: "영주시", dong: "풍기읍" },
    { value: "영천시", label: "영천시", dong: "화북면" }, { value: "상주시", label: "상주시", dong: "외남면" }, { value: "문경시", label: "문경시", dong: "마성면" },
    { value: "경산시", label: "경산시", dong: "남산면" },
    { value: "의성군", label: "의성군", dong: "단밀면" },
    { value: "청송군", label: "청송군", dong: "진보면" }, { value: "영양군", label: "영양군", dong: "입암면" }, { value: "영덕군", label: "영덕군", dong: "영덕읍" },
    { value: "청도군", label: "청도군", dong: "화양읍" }, { value: "고령군", label: "고령군", dong: "대가야읍" }, { value: "성주군", label: "성주군", dong: "성주읍" }, // 서울 성주군과 구분
    { value: "칠곡군", label: "칠곡군", dong: "왜관읍" }, { value: "예천군", label: "예천군", dong: "예천읍" }, { value: "봉화군", label: "봉화군", dong: "봉화읍" },
    { value: "울진군", label: "울진군", dong: "후포면" }, { value: "울릉군", label: "울릉군", dong: "울릉읍" },
    { value: "군위군", label: "군위군", dong: "군위읍" }, // 경북 군위군 추가 (대구 군위군과 별개로 존재 가능성)
  ],
  경남: [
    { value: "창원시", label: "창원시", dong: "마산합포구" }, { value: "진주시", label: "진주시", dong: "본성동" }, { value: "통영시", label: "통영시", dong: "문화동" },
    { value: "사천시", label: "사천시", dong: "동서동" }, { value: "김해시", label: "김해시", dong: "진영읍" }, { value: "밀양시", label: "밀양시", dong: "내이동" },
    { value: "거제시", label: "거제시", dong: "거제면" }, { value: "양산시", label: "양산시", dong: "원동면" }, { value: "의령군", label: "의령군", dong: "의령읍" },
    { value: "함안군", label: "함안군", dong: "가야읍" }, { value: "창녕군", label: "창녕군", dong: "창녕읍" }, { value: "고성군", label: "고성군", dong: "회화면" }, // 강원 고성군과 구분
    { value: "남해군", label: "남해군", dong: "삼동면" }, { value: "하동군", label: "하동군", dong: "북천면" }, { value: "산청군", label: "산청군", dong: "금서면" },
    { value: "함양군", label: "함양군", dong: "함양읍" }, { value: "거창군", label: "거창군", dong: "거창읍" }, { value: "합천군", label: "합천군", dong: "가회면" },
  ],
  제주: [
    { value: "제주시", label: "제주시", dong: "애월읍" }, { value: "서귀포시", label: "서귀포시", dong: "표선면" },
  ],
};

export const getMunicipalitiesForRegion = (regionValue: string): Municipality[] => {
  return municipalities[regionValue] || [];
};
