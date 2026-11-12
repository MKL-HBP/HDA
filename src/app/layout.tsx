import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하버브릭스 | AI 투자분석",
  description: "하버브릭스 투자 검토 워크스페이스. 외부 API 연결 없이 가상 기업의 샘플 보고서를 체험하세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
