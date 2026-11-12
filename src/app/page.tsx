"use client";

import { useEffect, useRef, useState, type FormEvent, type DragEvent } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BarChart3, Building2, Check, CheckCheck, ChevronRight, CircleHelp, FileCheck2, FileText, FlaskConical, Globe2, Layers3, LoaderCircle, LockKeyhole, Plus, ScanLine, ShieldCheck, Sparkles, TrendingUp, TriangleAlert, Upload, X } from "lucide-react";
import { sampleProvider, sampleReport, sampleStages, validatePdf, type InvestmentReport } from "@/lib/report";

type View = "upload" | "report";
type Status = "idle" | "validating" | "ready" | "preparing" | "complete";
type FileInfo = { name: string; size: number };
const workflow = ["IR 업로드", "AI 분석", "산업 조사", "재무 분석", "경쟁사·뉴스", "기업가치 평가", "최종 보고서"];
const reportSections = ["기업 개요", "사업 모델과 핵심 제품", "시장·경쟁 환경", "주요 재무정보", "투자 포인트와 위험요인", "추가 확인이 필요한 질문"];

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "compact" : ""}`}><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><div><strong>HARBORBRICKS<span className="brand-period">.</span></strong>{!compact && <small>INVESTMENT INTELLIGENCE</small>}</div></div>;
}

function SampleTag() { return <span className="sample-tag"><FlaskConical size={12} />샘플 데이터</span>; }

export default function Home() {
  const [view, setView] = useState<View>("upload");
  const [company, setCompany] = useState("");
  const [file, setFile] = useState<FileInfo | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(0);
  const [report, setReport] = useState<InvestmentReport | null>(null);
  const [request, setRequest] = useState<{ company: string; filename: string } | null>(null);
  const [help, setHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const validationId = useRef(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = status === "preparing" || status === "validating";

  useEffect(() => () => { controller.current?.abort(); validationId.current++; }, []);
  useEffect(() => { if (help) dialog.current?.showModal(); else dialog.current?.close(); }, [help]);
  useEffect(() => { if (view === "report") { window.scrollTo(0, 0); titleRef.current?.focus(); } }, [view]);

  function reset() {
    controller.current?.abort(); validationId.current++;
    setView("upload"); setCompany(""); setFile(null); setStatus("idle"); setError(""); setReport(null); setRequest(null); setStage(0);
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo(0, 0);
  }

  async function selectFiles(files: FileList | null) {
    if (busy || !files?.length) return;
    const selection = ++validationId.current;
    setError(""); setFile(null);
    if (files.length !== 1) { setError("PDF 파일을 한 번에 하나만 선택해 주세요."); setStatus("idle"); return; }
    setStatus("validating");
    const selected = files[0];
    const message = await validatePdf(selected);
    if (selection !== validationId.current) return;
    if (message) { setError(message); setStatus("idle"); }
    else { setFile({ name: selected.name, size: selected.size }); setStatus("ready"); }
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDragging(false);
    void selectFiles(event.dataTransfer.files);
  }

  async function start(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!company.trim()) { setError("기업명을 입력해 주세요."); companyRef.current?.focus(); return; }
    if (!file) { setError("먼저 PDF 파일을 선택해 주세요."); return; }
    setError(""); setStatus("preparing");
    setRequest({ company: company.trim(), filename: file.name });
    const current = new AbortController(); controller.current = current;
    try {
      const result = await sampleProvider.createReport(current.signal, setStage);
      if (current.signal.aborted) return;
      setReport(result); setStatus("complete"); setView("report");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setStatus("ready"); setError("샘플 보고서를 열지 못했습니다. 다시 시도해 주세요.");
    }
  }

  function showExample() {
    controller.current?.abort(); validationId.current++;
    setReport(sampleReport); setRequest(null); setStatus("complete"); setError(""); setView("report");
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main">본문으로 이동</a>
    <aside className="sidebar">
      <Brand />
      <div className="workspace-switch"><span className="workspace-avatar">HB</span><div><strong>하버브릭스</strong><small>투자 검토 워크스페이스</small></div><span className="workspace-dot" /></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="주 메뉴" className="main-nav">
        <button className={view === "upload" ? "active" : ""} onClick={() => setView("upload")}><Upload size={18} />IR 업로드<span className="nav-count">01</span></button>
        <button className={view === "report" ? "active" : ""} disabled={!report} onClick={() => setView("report")}><FileText size={18} />분석 보고서{report ? <span className="nav-count">1</span> : <span className="nav-count">—</span>}</button>
      </nav>
      <p className="nav-label research-label">RESEARCH TOOLS</p>
      <div className="future-nav"><span><Globe2 size={17} />산업·시장 조사<LockKeyhole size={12} /></span><span><BarChart3 size={17} />재무 분석<LockKeyhole size={12} /></span><span><Layers3 size={17} />기업가치 평가<LockKeyhole size={12} /></span><small>다음 단계에서 연결할 기능입니다</small></div>
      <div className="sidebar-bottom"><div className="sample-mode-card"><div><FlaskConical size={16} /><strong>지금은 샘플 모드</strong><span className="live-dot" /></div><p>가상 기업의 예시로<br />투자 검토 흐름을 경험하세요.</p><button onClick={() => setHelp(true)}>샘플 모드 안내<ArrowUpRight size={14} /></button></div><div className="sidebar-footer"><span className="user-avatar">HB</span><div><strong>하버브릭스 팀</strong><small>Local workspace</small></div><ShieldCheck size={16} /></div></div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div className="desktop-breadcrumb">워크스페이스<ChevronRight size={13} /><strong>{view === "upload" ? "IR 업로드" : "분석 보고서"}</strong></div><div className="mobile-brand"><Brand compact /></div><div className="topbar-right"><span className="local-label"><span />로컬 워크스페이스</span><span className="mode-pill">SAMPLE MODE</span><button className="icon-button help-button" aria-label="샘플 모드 도움말" onClick={() => setHelp(true)}><CircleHelp size={19} /></button></div></header>
      <main id="main" className="main-content">
        <div className="page-heading"><div><div className="eyebrow">HARBORBRICKS INTELLIGENCE</div><h1 ref={titleRef} tabIndex={-1}>{view === "upload" ? "더 나은 투자 판단의 시작" : "투자 검토 보고서"}<span className="heading-dot">.</span></h1><p>{view === "upload" ? "기업의 IR 자료에서 투자 검토의 첫 단서를 찾아보세요." : "기업의 핵심 정보부터 확인이 필요한 질문까지 한눈에 살펴보세요."}</p></div>{view === "report" ? <button className="secondary-button" onClick={reset}><Plus size={17} />새 분석</button> : <span className="version-label">WORKSPACE / 01</span>}</div>

        <section className="workflow" aria-label="전체 투자 검토 흐름"><div className="workflow-caption"><span>투자 검토 프로세스</span><small>전체 흐름 미리보기 · 현재 샘플 모드</small></div><ol>{workflow.map((item, i) => <li className={i === (view === "upload" ? 0 : 6) ? "current" : ""} key={item}><span className="step-number">{String(i + 1).padStart(2, "0")}</span><span>{item}</span>{i < 6 && <ChevronRight size={13} className="step-arrow" />}</li>)}</ol></section>

        {view === "upload" ? <>
          <div className="sample-notice"><span className="notice-icon"><FlaskConical size={18} /></span><div><strong>실제 분석 전, 샘플로 먼저 만나보세요.</strong><p>선택한 PDF는 분석·전송·저장하지 않습니다. 입력한 기업과 무관한 가상 기업의 예시 보고서가 표시됩니다.</p></div><span className="notice-tag">샘플 데이터</span></div>
          <div className="upload-grid"><section className="panel upload-panel"><div className="panel-heading"><span className="section-icon"><Upload size={20} /></span><div><h2>IR 자료 업로드</h2><p>검토할 기업과 IR 자료를 선택해 주세요.</p></div><span className="required-note">* 필수 입력</span></div>
            <form onSubmit={start} noValidate>
              <label htmlFor="company" className="field-label">기업명 <span>*</span></label>
              <input id="company" ref={companyRef} value={company} maxLength={100} onChange={e => { setCompany(e.target.value); setError(""); }} disabled={busy} placeholder="기업명을 입력해 주세요" autoComplete="organization" aria-required="true" aria-describedby="sample-input-note" />
              <div className="file-label-row"><label htmlFor="ir-file" className="field-label">IR 자료 <span>*</span></label><small>PDF · 최대 20MB · 1개</small></div>
              <input className="sr-only" id="ir-file" ref={inputRef} type="file" accept=".pdf,application/pdf" tabIndex={-1} disabled={busy} onChange={e => void selectFiles(e.target.files)} aria-label="IR PDF 파일 선택" />
              <div className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`} onDragOver={e => { e.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }} onDrop={handleDrop}>
                {file ? <><div className="selected-file-icon"><FileCheck2 size={32} /></div><strong className="selected-filename" title={file.name}>{file.name}</strong><span className="file-meta">{file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}<span>·</span>PDF 문서</span><span className="file-ready"><Check size={13} />파일 선택 완료 · 서버 전송 안 함</span><button type="button" className="text-button" disabled={busy} onClick={() => { setFile(null); setStatus("idle"); setError(""); }}>선택 해제<X size={13} /></button></> : <><span className="upload-illustration"><FileText size={32} strokeWidth={1.4} /><span><ArrowDownToLine size={14} /></span></span><strong>{status === "validating" ? "PDF 형식 확인 중…" : "IR 자료를 여기에 끌어다 놓으세요"}</strong><span className="dropzone-or">또는 아래 버튼으로 파일을 선택하세요</span><button type="button" className="file-button" disabled={busy} onClick={() => inputRef.current?.click()}><Plus size={16} />파일 선택</button></>}
              </div>
              <p id="sample-input-note" className="privacy-note"><LockKeyhole size={13} />파일은 이 브라우저에서만 선택되며, 새로고침하면 초기화됩니다.</p>
              {error && <p className="error-message" role="alert"><TriangleAlert size={15} />{error}</p>}
              {status === "preparing" && <div className="progress-block" role="status" aria-live="polite"><div><span><LoaderCircle className="spin" size={14} />{sampleStages[stage]}</span><strong>{Math.round((stage + 1) / 3 * 100)}%</strong></div><progress max={3} value={stage + 1} aria-label="샘플 보고서 준비 진행률" /><small>실제 PDF 분석이 아닌 샘플 화면 준비 과정입니다.</small></div>}
              <button type="submit" className="primary-button start-button" disabled={busy}>{status === "preparing" ? <LoaderCircle size={18} className="spin" /> : <Sparkles size={18} />}{status === "preparing" ? "샘플 보고서 준비 중" : "분석 시작"}{!busy && <><span className="button-label">샘플 모드</span><ArrowRight size={17} /></>}</button>
              {status === "preparing" ? <button type="button" className="cancel-button" onClick={() => { controller.current?.abort(); setStatus(file ? "ready" : "idle"); }}>준비 취소</button> : <p className="button-footnote">분석 시작 시 가상 기업의 샘플 보고서가 열립니다.</p>}
            </form>
          </section>

          <aside className="preview-column"><section className="report-preview"><div className="preview-topline"><span>REPORT PREVIEW</span><SampleTag /></div><div className="preview-company"><span className="company-symbol"><Building2 size={23} /></span><div><h3>블루포트 테크놀로지</h3><p>물류 · B2B SaaS<span>가상 기업</span></p></div></div><div className="preview-metrics"><div><small>2025년 매출</small><strong>120<span>억 원</span></strong></div><div><small>전년 대비 성장률</small><strong className="positive">+53.8<span>%</span></strong></div></div><div className="mini-chart" aria-label="샘플 매출: 2023년 48억, 2024년 78억, 2025년 120억 원"><span className="chart-caption">꾸준한 매출 성장 <TrendingUp size={14} /></span><div className="mini-chart-bars">{sampleReport.financials.map(y => <div key={y.year}><span style={{ height: `${y.revenue * .65}px` }} /><small>{y.year}</small></div>)}</div></div><div className="preview-takeaway"><Sparkles size={15} /><span>반복 구독 매출을 기반으로 성장하는<br />물류 소프트웨어 기업의 예시입니다.</span></div><button className="preview-button" onClick={showExample}>샘플 보고서 먼저 보기<ArrowUpRight size={17} /></button><p className="preview-note">파일 없이도 화면을 둘러볼 수 있어요</p></section>
            <section className="report-contents"><h3>보고서에 담기는 내용<span>6개 항목</span></h3><ul>{reportSections.map((s, i) => <li key={s}><span>{String(i + 1).padStart(2, "0")}</span>{s}<Check size={13} /></li>)}</ul></section>
          </aside></div>
          <section className="next-step"><span className="next-step-icon"><ScanLine size={23} /></span><div><span className="eyebrow">BUILT FOR YOUR NEXT DECISION</span><h3>자료를 이해하고, 핵심을 연결하고, 판단을 준비합니다.</h3><p>지금은 샘플로 시작하고, 다음 단계에서 실제 분석과 리서치를 연결합니다.</p></div><span className="next-step-label">IR → INSIGHT</span></section>
        </> : report && <Report report={report} request={request} />}
        <footer className="page-footer"><span>© 2026 HARBORBRICKS</span><span>명확한 근거, 더 나은 투자 판단.</span><span className="footer-mode"><span />샘플 모드 · 외부 서비스 미연결</span></footer>
      </main>
    </div>
    <dialog ref={dialog} onCancel={() => setHelp(false)} onClose={() => setHelp(false)} className="help-dialog"><div className="dialog-heading"><span className="section-icon"><FlaskConical size={21} /></span><button aria-label="안내 닫기" className="icon-button" onClick={() => setHelp(false)}><X size={20} /></button></div><h2>샘플 모드 안내</h2><p>화면과 투자 검토 흐름을 확인하는 첫 번째 버전입니다.</p><ul><li>기업명과 파일명은 현재 화면에서만 사용합니다.</li><li>PDF 형식만 확인하며, 내용 분석과 서버 업로드는 하지 않습니다.</li><li>보고서의 기업·재무 수치·경쟁사는 모두 가상의 예시입니다.</li><li>실시간 산업·뉴스 조회와 기업가치 산정은 연결 전입니다.</li></ul><button className="primary-button" onClick={() => setHelp(false)}>확인</button></dialog>
  </div>;
}

function SectionHeading({ index, title, note }: { index: number; title: string; note?: string }) {
  return <div className="report-section-heading"><span>{String(index).padStart(2, "0")}</span><h2>{title}</h2>{note && <small>{note}</small>}</div>;
}

function Report({ report, request }: { report: InvestmentReport; request: { company: string; filename: string } | null }) {
  const latest = report.financials.at(-1)!;
  const previous = report.financials.at(-2)!;
  const growth = (latest.revenue / previous.revenue - 1) * 100;
  const margin = latest.operatingProfit / latest.revenue * 100;
  return <div className="report-page">
    <div className="sample-notice report-notice"><span className="notice-icon"><FlaskConical size={18} /></span><div><strong>샘플 데이터 · 실제 투자 분석 결과가 아닙니다.</strong><p>모든 기업 정보와 수치는 가상입니다. 선택한 PDF를 분석하지 않았으며, 산업·뉴스 조회나 기업가치 평가를 수행하지 않았습니다.</p>{request && <p className="request-context">입력한 기업: <b>{request.company}</b> · 선택한 파일: <b>{request.filename}</b><span>아래 보고서는 입력한 기업과 무관한 고정 예시입니다.</span></p>}</div></div>
    <section className="company-hero"><div className="company-hero-main"><div className="hero-eyebrow">SAMPLE INVESTMENT MEMO<span>가상 기업</span></div><h2>{report.company.name}</h2><p>{report.company.englishName}</p><div className="hero-tags"><span>{report.company.sector}</span><span>{report.company.stage}</span><span>기준 연도 2025</span></div></div><div className="hero-insight"><span><Sparkles size={15} />예시 핵심 관점</span><h3>반복 매출의 성장성,<br />현금흐름의 검증이 관건.</h3><p>성장 지표와 고객 유지율을 함께 검토하세요.</p></div><div className="hero-decoration" aria-hidden="true" /></section>
    <div className="kpi-grid"><Metric label="매출액" value={latest.revenue.toString()} unit="억 원" detail="2025년 · 가상 수치" /><Metric label="매출 성장률" value={`+${growth.toFixed(1)}`} unit="%" detail="전년 대비 · 계산값" positive /><Metric label="영업이익" value={latest.operatingProfit.toString()} unit="억 원" detail="2025년 · 가상 수치" /><Metric label="영업이익률" value={margin.toFixed(1)} unit="%" detail="영업이익 ÷ 매출액" /></div>
    <nav className="report-jump-nav" aria-label="보고서 목차">{["기업 개요", "사업 모델", "시장·경쟁", "재무정보", "투자·위험", "확인 질문"].map((s, i) => <a key={s} href={`#section-${i + 1}`}>{s}<ArrowUpRight size={12} /></a>)}</nav>
    <section className="panel report-section" id="section-1"><SectionHeading index={1} title="기업 개요" /><p className="company-description">{report.company.description}</p><dl className="company-facts"><div><dt>설립</dt><dd>{report.company.founded}</dd></div><div><dt>소재지</dt><dd>{report.company.location}</dd></div><div><dt>임직원</dt><dd>{report.company.employees}명</dd></div><div><dt>투자 단계</dt><dd>{report.company.stage}</dd></div></dl></section>
    <section className="panel report-section" id="section-2"><SectionHeading index={2} title="사업 모델과 핵심 제품" note="매출 비중은 가상 수치" /><div className="product-grid">{report.business.map((b, i) => <div className="product-card" key={b.name}><span className={`product-icon product-${i}`}><Layers3 size={20} /></span><h3>{b.name}</h3><p>{b.description}</p><div className="product-share"><span>매출 비중</span><strong>{b.share}%</strong></div><div className="share-track"><span style={{ width: `${b.share}%` }} /></div></div>)}</div></section>
    <section className="panel report-section" id="section-3"><SectionHeading index={3} title="시장·경쟁 환경" note="외부 조사 전 · 예시 시나리오" /><div className="market-intro"><Globe2 size={22} /><div><h3>{report.market.theme}</h3><p>{report.market.description}</p></div></div><div className="table-scroll"><table><caption className="sr-only">가상 경쟁사 비교</caption><thead><tr><th>기업</th><th>주요 시장</th><th>서비스 특성</th></tr></thead><tbody>{report.market.competitors.map(c => <tr key={c.name}><th scope="row">{c.name}</th><td>{c.focus}</td><td>{c.distinction}</td></tr>)}</tbody></table></div><p className="source-note">출처: 앱에 내장된 가상 시나리오 · 실시간 뉴스 및 실제 경쟁사 자료 미조회</p></section>
    <section className="panel report-section" id="section-4"><SectionHeading index={4} title="주요 재무정보" note="단위: 억 원 · 모두 가상 수치" /><div className="financial-layout"><div className="revenue-chart"><h3>연도별 매출 추이<span>샘플</span></h3><div className="revenue-bars">{report.financials.map(y => <div key={y.year}><strong>{y.revenue}</strong><span style={{ height: `${y.revenue * 1.15}px` }} /><small>{y.year}</small></div>)}</div></div><div className="table-scroll"><table className="financial-table"><caption className="sr-only">2023년부터 2025년까지의 가상 재무정보, 단위 억 원</caption><thead><tr><th>항목</th>{report.financials.map(y => <th key={y.year}>{y.year}</th>)}</tr></thead><tbody>{([{ label: "매출액", key: "revenue" }, { label: "영업이익", key: "operatingProfit" }, { label: "당기순이익", key: "netIncome" }, { label: "현금성 자산", key: "cash" }] as const).map(row => <tr key={row.key}><th scope="row">{row.label}</th>{report.financials.map(y => <td className={y[row.key] < 0 ? "negative" : ""} key={y.year}>{y[row.key]}</td>)}</tr>)}</tbody></table></div></div><details className="calculation-details"><summary>지표 계산 근거 보기</summary><p>매출 성장률 = (2025년 매출 ÷ 2024년 매출 − 1) × 100 = (120 ÷ 78 − 1) × 100 ≈ 53.8%</p><p>영업이익률 = 영업이익 ÷ 매출액 × 100 = 15 ÷ 120 × 100 = 12.5%</p><p>원천 수치는 가상 데이터입니다. 계산 결과는 소수점 첫째 자리에서 표시합니다.</p></details></section>
    <section className="report-section thesis-section" id="section-5"><SectionHeading index={5} title="투자 포인트와 위험요인" /><div className="thesis-grid"><div className="panel thesis-panel opportunities"><h3><TrendingUp size={19} />투자 포인트<span>03</span></h3>{report.opportunities.map(o => <div className="thesis-item" key={o.title}><CheckCheck size={16} /><div><h4>{o.title}</h4><p>{o.description}</p></div></div>)}</div><div className="panel thesis-panel risks"><h3><TriangleAlert size={19} />위험요인<span>03</span></h3>{report.risks.map(r => <div className="thesis-item" key={r.title}><span className="risk-dot" /><div><h4>{r.title}</h4><p>{r.description}</p></div></div>)}</div></div></section>
    <section className="panel report-section" id="section-6"><SectionHeading index={6} title="추가 확인이 필요한 질문" note="후속 검토 체크리스트" /><div className="questions">{report.questions.map((q, i) => <label className="question" key={q.question}><input type="checkbox" /><span><span className="question-top"><small>Q{String(i + 1).padStart(2, "0")} · {q.category}</small><strong>{q.question}</strong></span><span className="question-evidence">확인 자료: {q.evidence}</span></span></label>)}</div><p className="source-note">체크 상태는 저장되지 않으며, 화면을 나가면 초기화됩니다.</p></section>
    <div className="valuation-pending"><span className="section-icon"><BarChart3 size={21} /></span><div><h3>기업가치 평가는 다음 단계에서 연결됩니다.</h3><p>검증 가능한 재무자료와 가정을 바탕으로 계산식·출처·민감도를 함께 제공할 예정입니다.</p></div><span>미산정</span></div>
    <p className="report-disclaimer"><FlaskConical size={14} />이 보고서는 화면 체험을 위한 샘플 데이터이며, 실제 기업에 대한 투자 의견이 아닙니다.</p>
  </div>;
}

function Metric({ label, value, unit, detail, positive }: { label: string; value: string; unit: string; detail: string; positive?: boolean }) {
  return <div className="metric"><span>{label}</span><strong className={positive ? "positive" : ""}>{value}<small>{unit}</small></strong><p>{positive && <TrendingUp size={12} />}{detail}</p></div>;
}
