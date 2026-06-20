# 🍃 녹빛 옷장 (Green Closet)

> [cite_start]**"당신의 옷장에 초록빛 가치를 더하다"** > 사용자가 가진 옷을 등록하고, 환경적 영향을 최소화하면서도 스타일을 살릴 수 있는 친환경 '캡슐 워드로브(Capsule Wardrobe)' 웹 서비스의 프로토타입입니다. [cite: 4, 5]

본 프로젝트는 **GitHub Pages**를 통해 별도의 서버(Serverless) 없이 브라우저 내에서 완벽하게 구동되는 **단일 페이지 애플리케이션(SPA)** 형태로 개발되었습니다. 

---

## 🌟 핵심 가치 (Core Values)
* [cite_start]**패스트 패션 소비 줄이기:** 자신이 가진 옷을 명확히 인지하고 미니멀 라이프 실천 [cite: 6]
* [cite_start]**미세플라스틱 배출 최소화:** 소재에 따른 올바른 친환경 세탁법 제안 [cite: 6]
* [cite_start]**환경 부담 지수 시각화:** 의류 소재별 생태적 영향도를 직관적으로 제공 [cite: 25]

---

## 🛠️ 기술 스택 (Tech Stack)
* [cite_start]**Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+) [cite: 47]
* **Database & Storage:** Web LocalStorage & SessionStorage (사용자 정보 및 의류 데이터 브라우저 저장)
* **Deployment:** GitHub Pages (정적 웹 호스팅)

---

## 🚀 주요 기능 (Key Features)

### 1. 보안 및 유효성 검사 (Auth & Validation)
* [cite_start]**LocalStorage 회원가입/로그인:** 회원 정보를 브라우저 저장소에 안전하게 격리·매핑하여 관리합니다[cite: 24].
* [cite_start]**CapsLock 실시간 감지:** 비밀번호 입력 창에서 사용자의 캡스록 활성화 여부를 실시간 알림으로 피드백합니다[cite: 11].
* [cite_start]**간편 로그인 UI:** 확장성을 고려한 소셜 로그인(Google, Kakao, Naver) 연동 인터페이스가 구현되어 있습니다[cite: 12].

### 2. 최초 환경 성향 설문 (Eco-Survey)
* [cite_start]가입 후 최초 1회 진입하는 화면으로, 사용자의 선호 스타일 카테고리(캐주얼, 포멀, 스트리트, 어반 등) 및 환경 관심도를 파악합니다[cite: 13, 14, 15].
* [cite_start]설문 데이터를 기반으로 향후 개인화된 친환경 워드로브 알고리즘의 기초 데이터로 활용합니다[cite: 27, 30].

### 3. 드래그 앤 드롭 디지털 옷장 (Digital Closet)
* [cite_start]**직관적인 이미지 업로드:** 드래그 앤 드롭 UI 및 파일 탐색기를 통해 옷 사진을 간편하게 첨부할 수 있습니다[cite: 21].
* [cite_start]**소재별 환경 부담 지수 자동 연산:** 등록된 의류의 소재(폴리에스테르, 면, 울 등)를 분석하여 환경 부담 수준을 '높음/보통/낮음' 단계로 자동 계산하여 카드 컴포넌트에 반영합니다[cite: 20, 25, 48].
* [cite_start]**맞춤형 친환경 세탁 팁 가이드:** 합성섬유 포함 여부에 따른 미세플라스틱 저감 세탁망 사용 권장, 찬물 세탁 안내 등 환경 가이드를 매칭하여 출력합니다[cite: 39, 40, 42, 43].

---

## 📂 파일 구조 (Directory Structure)
```text
├── index.html       # 메인 마크업, CSS 스타일 및 JavaScript 인앱 기동 로직 통합 파일
└── README.md        # 프로젝트 설명서 (현재 파일)
