import assert from "node:assert/strict";
import test from "node:test";
import { MAX_PDF_BYTES, sampleProvider, sampleReport, validatePdf } from "../src/lib/report.ts";

test("accepts PDF signature and case-insensitive extension", async () => {
  assert.equal(await validatePdf(new File(["%PDF-1.4\n%%EOF"], "IR.PDF", { type: "application/pdf" })), null);
});

test("rejects empty, renamed non-PDF, and oversized files", async () => {
  assert.match(await validatePdf(new File([], "empty.pdf")), /비어/);
  assert.match(await validatePdf(new File(["%PDF-1.4"], "document.txt")), /PDF 파일만/);
  assert.match(await validatePdf(new File(["plain text"], "renamed.pdf")), /PDF 형식/);
  assert.match(await validatePdf(new File([new Uint8Array(MAX_PDF_BYTES + 1)], "large.pdf")), /20MB/);
});

test("accepts the 20 MB boundary", async () => {
  const bytes = new Uint8Array(MAX_PDF_BYTES);
  bytes.set(new TextEncoder().encode("%PDF-1.4"));
  assert.equal(await validatePdf(new File([bytes], "boundary.pdf")), null);
});

test("sample provider returns only the fixed fictional report without a network call", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("Sample mode must not call an API"); };
  try {
    const stages = [];
    const report = await sampleProvider.createReport(new AbortController().signal, stage => stages.push(stage));
    assert.equal(report, sampleReport);
    assert.equal(report.dataSource, "sample");
    assert.equal(report.company.name, "블루포트 테크놀로지");
    assert.deepEqual(stages, [0, 1, 2]);
  } finally { globalThis.fetch = originalFetch; }
});

test("cancellation stops preparation without returning a report", async () => {
  const controller = new AbortController();
  const stages = [];
  const result = sampleProvider.createReport(controller.signal, stage => stages.push(stage));
  controller.abort();
  await assert.rejects(result, { name: "AbortError" });
  assert.deepEqual(stages, [0]);
});
