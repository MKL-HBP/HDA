export type FinancialYear = {
  year: string;
  revenue: number;
  operatingProfit: number;
  netIncome: number;
  cash: number;
};

export type InvestmentReport = {
  dataSource: "sample";
  company: { name: string; englishName: string; sector: string; founded: string; location: string; employees: number; stage: string; description: string };
  business: { name: string; description: string; share: number }[];
  market: { theme: string; description: string; competitors: { name: string; focus: string; distinction: string }[] };
  financials: FinancialYear[];
  opportunities: { title: string; description: string }[];
  risks: { title: string; description: string }[];
  questions: { category: string; question: string; evidence: string }[];
};

// All names, figures, comparisons and claims below are invented demonstration data.
// User input and PDF contents must never be substituted into this fixture.
export const sampleReport: InvestmentReport = {
  dataSource: "sample",
  company: {
    name: "블루포트 테크놀로지",
    englishName: "BLUEPORT TECHNOLOGIES",
    sector: "물류 · B2B SaaS",
    founded: "2020년",
    location: "서울, 대한민국",
    employees: 62,
    stage: "Series B",
    description: "중소·중견 유통기업의 재고, 주문, 배송을 하나로 연결하는 클라우드 물류 소프트웨어 기업입니다. 반복 구독 매출을 기반으로 고객사의 물류 운영 효율을 높입니다.",
  },
  business: [
    { name: "Blueport Cloud", description: "재고·주문·배송을 통합 관리하는 월 구독형 플랫폼", share: 72 },
    { name: "Blueport Insight", description: "수요 예측과 재고 최적화를 지원하는 분석 모듈", share: 18 },
    { name: "도입 및 연동 서비스", description: "고객사 ERP·커머스 시스템 연동과 초기 구축", share: 10 },
  ],
  market: {
    theme: "물류 운영의 디지털 전환",
    description: "이 예시는 다채널 유통 확대와 재고 관리 자동화 수요가 성장한다는 가정을 사용합니다. 실제 시장 규모와 성장률은 조사하지 않았으며, 고객 인터뷰와 외부 자료를 통한 검증이 필요합니다.",
    competitors: [
      { name: "플로우스택 (가상)", focus: "대형 물류센터 자동화", distinction: "대기업 중심의 구축형 솔루션" },
      { name: "스톡웨이브 (가상)", focus: "소상공인 재고 관리", distinction: "단일 매장 중심의 경량 서비스" },
      { name: "블루포트 (가상)", focus: "중견 유통기업 통합 운영", distinction: "다채널 연동과 모듈형 구독" },
    ],
  },
  financials: [
    { year: "2023", revenue: 48, operatingProfit: -8, netIncome: -10, cash: 24 },
    { year: "2024", revenue: 78, operatingProfit: 4, netIncome: 2, cash: 30 },
    { year: "2025", revenue: 120, operatingProfit: 15, netIncome: 11, cash: 46 },
  ],
  opportunities: [
    { title: "반복 매출 중심의 사업 구조", description: "플랫폼·분석 모듈의 구독 매출 비중 90%를 가정합니다. 계약 갱신과 추가 모듈 판매가 성장의 핵심입니다." },
    { title: "매출 성장과 수익성 개선", description: "예시 매출은 78억 원에서 120억 원으로 증가합니다. 영업이익률은 5.1%에서 12.5%로 개선됩니다." },
    { title: "업무 통합에 따른 확장 가능성", description: "고객사의 물류 업무에 깊이 연동될수록 추가 서비스 판매 기회가 확대된다는 가정입니다." },
  ],
  risks: [
    { title: "주요 고객에 대한 매출 의존", description: "상위 5개 고객의 매출 비중을 38%로 가정합니다. 주요 계약 종료 시 매출 변동성이 커질 수 있습니다." },
    { title: "성장 비용과 현금흐름", description: "고객 획득과 시스템 연동에 비용이 발생합니다. 이익 증가가 실제 현금 유입으로 연결되는지 확인해야 합니다." },
    { title: "제품 차별화의 지속성", description: "기존 ERP 기업과 신규 사업자의 진입을 가정합니다. 가격 경쟁과 고객 전환 가능성 검토가 필요합니다." },
  ],
  questions: [
    { category: "고객", question: "고객 유지율과 순매출 유지율은 어떻게 변화하고 있나요?", evidence: "월별 고객 코호트, 해지 내역, 갱신 계약" },
    { category: "매출", question: "상위 고객의 계약 기간과 해지 조건은 무엇인가요?", evidence: "상위 5개 고객 계약서, 고객별 매출" },
    { category: "재무", question: "영업이익과 영업현금흐름 간 차이는 어디에서 발생하나요?", evidence: "현금흐름표, 매출채권 연령 분석" },
    { category: "성장", question: "신규 고객 획득 비용은 몇 개월 안에 회수되나요?", evidence: "영업·마케팅 비용, 고객별 공헌이익" },
  ],
};

export const sampleStages = ["샘플 템플릿 불러오는 중", "가상 기업의 예시 데이터 준비 중", "샘플 보고서 화면 구성 중"];

export interface AnalysisProvider {
  readonly mode: "sample";
  createReport(signal: AbortSignal, onStage: (stage: number) => void): Promise<InvestmentReport>;
}

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Cancelled", "AbortError"));
    const abort = () => { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

// No network, file parsing, storage or external API calls in sample mode.
export const sampleProvider: AnalysisProvider = {
  mode: "sample",
  async createReport(signal, onStage) {
    for (let i = 0; i < sampleStages.length; i++) {
      onStage(i);
      await delay(650, signal);
    }
    return sampleReport;
  },
};

export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export async function validatePdf(file: File): Promise<string | null> {
  if (!/\.pdf$/i.test(file.name)) return "PDF 파일만 선택할 수 있습니다.";
  if (!file.size) return "비어 있는 파일입니다. 다른 PDF를 선택해 주세요.";
  if (file.size > MAX_PDF_BYTES) return "파일 크기는 20MB 이하여야 합니다.";
  // Check only the format signature, never parse or analyze document contents.
  try {
    const signature = await file.slice(0, 5).text();
    if (signature !== "%PDF-") return "PDF 형식을 확인할 수 없습니다. 올바른 PDF를 선택해 주세요.";
  } catch { return "파일을 읽을 수 없습니다. 다시 선택해 주세요."; }
  return null;
}
