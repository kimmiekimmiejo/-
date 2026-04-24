import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEYS = {
  applicants: "interview-result-email-mvp-applicants",
  settings: "interview-result-email-mvp-settings",
};

const defaultSettings = {
  companyName: "자인컴퍼니",
  recruiterName: "김담당",
  replyEmail: "recruit@example.com",
};

const initialApplicants = [
  {
    id: 1,
    name: "김민준",
    email: "minjun.kim@example.com",
    position: "프론트엔드 개발자",
    result: "pass",
    status: "draft",
    memo: "React 경험 우수",
    customSubject: null,
    customBody: null,
    edited: false,
    sentAt: "",
  },
  {
    id: 2,
    name: "이서연",
    email: "seoyeon.lee@example.com",
    position: "HR 매니저",
    result: "fail",
    status: "previewed",
    memo: "조직문화 이해도 높음",
    customSubject: null,
    customBody: null,
    edited: false,
    sentAt: "",
  },
  {
    id: 3,
    name: "박지훈",
    email: "jihoon.park@example.com",
    position: "백엔드 개발자",
    result: "pass",
    status: "queued",
    memo: "API 설계 경험 보유",
    customSubject: null,
    customBody: null,
    edited: false,
    sentAt: "",
  },
  {
    id: 4,
    name: "최유진",
    email: "yujin.choi@example.com",
    position: "UX 디자이너",
    result: "fail",
    status: "draft",
    memo: "포트폴리오 인상적",
    customSubject: null,
    customBody: null,
    edited: false,
    sentAt: "",
  },
  {
    id: 5,
    name: "정하늘",
    email: "haneul.jung@example.com",
    position: "데이터 분석가",
    result: "pass",
    status: "sent",
    memo: "SQL 테스트 우수",
    customSubject: null,
    customBody: null,
    edited: false,
    sentAt: "2026.04.24 09:30",
  },
];

const iconPaths = {
  check: "M20 6 9 17l-5-5",
  clock: "M12 6v6l4 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm6-2 4 4",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12",
  upload: "M12 16V4m0 0-5 5m5-5 5 5M4 20h16",
  userPlus: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm10-4v6m3-3h-6",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  x: "M18 6 6 18M6 6l12 12",
  send: "M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h8M8 9h2",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8",
  alert: "M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z",
};

const validResults = new Set(["pass", "fail"]);
const validStatuses = new Set(["draft", "previewed", "queued", "sent"]);

const statusMap = {
  draft: { label: "작성 전", className: "bg-slate-100 text-slate-700", icon: "file" },
  previewed: { label: "미리보기 완료", className: "bg-blue-50 text-blue-700", icon: "mail" },
  queued: { label: "발송 대기", className: "bg-amber-50 text-amber-700", icon: "clock" },
  sent: { label: "발송 완료", className: "bg-emerald-50 text-emerald-700", icon: "check" },
};

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(key, fallback) {
  if (!hasStorage()) return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (!hasStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeApplicant(applicant, index) {
  const edited = Boolean(applicant?.edited);
  const id = Number.isFinite(Number(applicant?.id)) ? Number(applicant.id) : index + 1;
  const result = validResults.has(applicant?.result) ? applicant.result : "pass";
  const status = validStatuses.has(applicant?.status) ? applicant.status : "draft";

  return {
    id,
    name: typeof applicant?.name === "string" && applicant.name.trim() ? applicant.name.trim() : `지원자 ${index + 1}`,
    email: typeof applicant?.email === "string" ? applicant.email.trim() : "",
    position: typeof applicant?.position === "string" && applicant.position.trim() ? applicant.position.trim() : "미지정 직무",
    result,
    status,
    memo: typeof applicant?.memo === "string" ? applicant.memo.trim() : "",
    customSubject: edited && typeof applicant?.customSubject === "string" ? applicant.customSubject : null,
    customBody: edited && typeof applicant?.customBody === "string" ? applicant.customBody : null,
    edited,
    sentAt: typeof applicant?.sentAt === "string" ? applicant.sentAt : "",
  };
}

function getInitialApplicants() {
  const stored = readStorage(STORAGE_KEYS.applicants, null);
  if (!Array.isArray(stored)) return initialApplicants;

  const normalized = stored.map(normalizeApplicant).filter((applicant) => applicant.email === "" || isValidEmail(applicant.email));
  return normalized.length ? normalized : initialApplicants;
}

function getInitialSettings() {
  const stored = readStorage(STORAGE_KEYS.settings, null);
  if (!stored || typeof stored !== "object") return defaultSettings;

  return {
    companyName: typeof stored.companyName === "string" ? stored.companyName : defaultSettings.companyName,
    recruiterName: typeof stored.recruiterName === "string" ? stored.recruiterName : defaultSettings.recruiterName,
    replyEmail: typeof stored.replyEmail === "string" ? stored.replyEmail : defaultSettings.replyEmail,
  };
}

function Icon({ name, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name] || ""} />
    </svg>
  );
}

function Button({ children, className = "", type = "button", ...props }) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function createMailTemplate(applicant, settings) {
  const companyName = settings.companyName?.trim() || "회사명";
  const recruiterName = settings.recruiterName?.trim() || "채용담당자";
  const applicantName = applicant?.name?.trim() || "지원자";
  const position = applicant?.position?.trim() || "지원 포지션";

  if (applicant?.result === "pass") {
    return {
      subject: `[${companyName}] 1차 면접 결과 및 추후 전형 안내드립니다`,
      body: `안녕하세요, ${applicantName}님.\n${companyName} 채용담당자입니다.\n\n먼저 ${position} 포지션에 지원해주시고, 1차 면접에 귀한 시간 내어 참여해주셔서 진심으로 감사드립니다.\n\n면접 결과, ${applicantName}님께서는 1차 면접에 합격하셨음을 안내드립니다.\n추후 진행될 2차 면접 일정과 세부 사항은 내부 일정 확인 후 별도로 안내드릴 예정입니다.\n\n다시 한번 지원과 면접 참여에 감사드리며, 다음 전형에서도 좋은 대화 나눌 수 있기를 기대하겠습니다.\n\n감사합니다.\n${recruiterName} 드림`,
    };
  }

  return {
    subject: `[${companyName}] 1차 면접 결과 안내드립니다`,
    body: `안녕하세요, ${applicantName}님.\n${companyName} 채용담당자입니다.\n\n먼저 ${position} 포지션에 지원해주시고, 1차 면접에 귀한 시간 내어 참여해주셔서 진심으로 감사드립니다.\n\n면접 이후 내부적으로 신중히 검토한 결과, 아쉽게도 이번 전형에서는 함께하지 못하게 되었음을 안내드립니다.\n\n귀한 시간과 관심을 보내주신 점 다시 한번 깊이 감사드리며, 향후 더 좋은 기회로 다시 만나뵐 수 있기를 진심으로 바랍니다.\n\n감사합니다.\n${recruiterName} 드림`,
  };
}

function getEditableMail(applicant, settings) {
  const template = createMailTemplate(applicant, settings);
  return {
    subject: applicant?.customSubject ?? template.subject,
    body: applicant?.customBody ?? template.body,
  };
}

function runSelfTests() {
  const settings = { companyName: "테스트회사", recruiterName: "테스터" };
  const passApplicant = { name: "홍길동", position: "기획자", result: "pass", customSubject: null, customBody: null };
  const failApplicant = { name: "김영희", position: "디자이너", result: "fail", customSubject: null, customBody: null };
  const passMail = createMailTemplate(passApplicant, settings);
  const failMail = createMailTemplate(failApplicant, settings);
  const blankMail = getEditableMail({ ...passApplicant, customSubject: "", customBody: "" }, settings);
  const normalized = normalizeApplicant({ id: "7", name: "  박테스트  ", position: "  PM  ", result: "unknown", status: "bad" }, 0);

  console.assert(passMail.subject.includes("추후 전형"), "합격 메일 제목에는 추후 전형 안내가 포함되어야 합니다.");
  console.assert(passMail.body.includes("합격"), "합격 메일 본문에는 합격 안내가 포함되어야 합니다.");
  console.assert(passMail.body.includes("2차 면접"), "합격 메일 본문에는 2차 면접 안내가 포함되어야 합니다.");
  console.assert(failMail.subject.includes("결과 안내"), "불합격 메일 제목에는 결과 안내가 포함되어야 합니다.");
  console.assert(failMail.body.includes("아쉽게도"), "불합격 메일 본문에는 정중한 불합격 안내가 포함되어야 합니다.");
  console.assert(failMail.body.includes("김영희"), "메일 본문에는 지원자 이름이 반영되어야 합니다.");
  console.assert(blankMail.subject === "", "사용자가 제목을 비우면 빈 제목이 유지되어야 합니다.");
  console.assert(blankMail.body === "", "사용자가 본문을 비우면 빈 본문이 유지되어야 합니다.");
  console.assert(isValidEmail("test@example.com"), "정상 이메일은 유효해야 합니다.");
  console.assert(!isValidEmail("wrong-email"), "잘못된 이메일은 유효하지 않아야 합니다.");
  console.assert(normalized.id === 7 && normalized.name === "박테스트" && normalized.result === "pass" && normalized.status === "draft", "지원자 데이터 정규화가 안정적으로 동작해야 합니다.");
}

function StatCard({ title, value, icon, caption }) {
  return (
    <Card className="rounded-2xl">
      <div className="flex items-center gap-4 p-5">
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon name={icon} className="h-5 w-5 text-slate-700" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {caption && <p className="mt-1 text-xs text-slate-400">{caption}</p>}
        </div>
      </div>
    </Card>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <Icon name="search" className="h-7 w-7 text-slate-400" />
      <p className="font-medium text-slate-700">검색 결과가 없습니다.</p>
      <p className="text-sm text-slate-500">검색어 또는 필터를 변경해보세요.</p>
    </div>
  );
}

export default function InterviewResultEmailMVP() {
  const [applicants, setApplicants] = useState(getInitialApplicants);
  const [selectedId, setSelectedId] = useState(() => getInitialApplicants()[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState(getInitialSettings);
  const [newApplicant, setNewApplicant] = useState({
    name: "",
    email: "",
    position: "",
    result: "pass",
    memo: "",
  });
  const toastTimerRef = useRef(null);

  useEffect(() => {
    runSelfTests();
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.applicants, applicants);
  }, [applicants]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const selectedApplicant = useMemo(() => applicants.find((item) => item.id === selectedId) || applicants[0] || null, [applicants, selectedId]);

  useEffect(() => {
    if (selectedApplicant && selectedApplicant.id !== selectedId) {
      setSelectedId(selectedApplicant.id);
    }
  }, [selectedApplicant, selectedId]);

  const mail = selectedApplicant ? getEditableMail(selectedApplicant, settings) : { subject: "", body: "" };

  const stats = useMemo(() => {
    return {
      total: applicants.length,
      pass: applicants.filter((a) => a.result === "pass").length,
      fail: applicants.filter((a) => a.result === "fail").length,
      sent: applicants.filter((a) => a.status === "sent").length,
    };
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applicants.filter((a) => {
      const matchesQuery = `${a.name} ${a.email} ${a.position}`.toLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === "all" || a.result === filter || a.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [applicants, query, filter]);

  function showToast(message) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2200);
  }

  function updateApplicant(id, updates) {
    setApplicants((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function handleResultChange(id, result) {
    setSelectedId(id);
    updateApplicant(id, {
      result: validResults.has(result) ? result : "pass",
      status: "draft",
      customSubject: null,
      customBody: null,
      edited: false,
      sentAt: "",
    });
    showToast(result === "pass" ? "합격 메일 템플릿으로 변경되었습니다." : "불합격 메일 템플릿으로 변경되었습니다.");
  }

  function handlePreviewComplete() {
    if (!selectedApplicant) return;
    updateApplicant(selectedApplicant.id, { status: "previewed" });
    showToast("메일 미리보기 완료 상태로 변경했습니다.");
  }

  function handleQueue() {
    if (!selectedApplicant) return;
    updateApplicant(selectedApplicant.id, { status: "queued" });
    showToast("발송 대기 상태로 변경했습니다. 실제 메일은 발송되지 않습니다.");
  }

  function handleSent() {
    if (!selectedApplicant) return;
    const now = new Date();
    const sentAt = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    updateApplicant(selectedApplicant.id, { status: "sent", sentAt });
    showToast("발송 완료로 표시했습니다. 실제 메일은 발송되지 않았습니다.");
  }

  function handleSubjectChange(value) {
    if (!selectedApplicant) return;
    updateApplicant(selectedApplicant.id, {
      customSubject: value,
      edited: true,
    });
  }

  function handleBodyChange(value) {
    if (!selectedApplicant) return;
    updateApplicant(selectedApplicant.id, {
      customBody: value,
      edited: true,
    });
  }

  function handleAddApplicant() {
    const trimmedApplicant = {
      name: newApplicant.name.trim(),
      email: newApplicant.email.trim(),
      position: newApplicant.position.trim(),
      result: newApplicant.result,
      memo: newApplicant.memo.trim(),
    };

    if (!trimmedApplicant.name || !trimmedApplicant.email || !trimmedApplicant.position) {
      showToast("이름, 이메일, 지원 직무를 입력해주세요.");
      return;
    }

    if (!isValidEmail(trimmedApplicant.email)) {
      showToast("올바른 이메일 형식이 아닙니다.");
      return;
    }

    const maxId = applicants.length ? Math.max(...applicants.map((a) => a.id)) : 0;
    const next = {
      id: maxId + 1,
      ...trimmedApplicant,
      result: validResults.has(trimmedApplicant.result) ? trimmedApplicant.result : "pass",
      status: "draft",
      customSubject: null,
      customBody: null,
      edited: false,
      sentAt: "",
    };

    setApplicants((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setNewApplicant({ name: "", email: "", position: "", result: "pass", memo: "" });
    setShowAddForm(false);
    showToast("지원자가 추가되었습니다.");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700">디자인 확인용 MVP</Badge>
              <Badge className="bg-slate-100 text-slate-600">실제 메일 미발송</Badge>
              <Badge className="bg-emerald-50 text-emerald-700">외부 아이콘 의존성 제거</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">면접 결과 메일 발송 관리</h1>
            <p className="mt-2 text-sm text-slate-500">지원자별 1차 면접 결과 메일을 생성하고, 발송 전 내용을 확인하세요.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowAddForm(true)} className="bg-slate-900 text-white hover:bg-slate-800">
              <Icon name="userPlus" className="mr-2 h-4 w-4" /> 지원자 추가
            </Button>
            <Button onClick={() => showToast("CSV 업로드는 디자인 확인용 버튼입니다.")} className="bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              <Icon name="upload" className="mr-2 h-4 w-4" /> CSV 업로드
            </Button>
            <Button onClick={() => setShowSettings(true)} className="bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              <Icon name="settings" className="mr-2 h-4 w-4" /> 설정
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard title="전체 지원자" value={stats.total} icon="users" caption="등록된 지원자" />
          <StatCard title="1차 합격" value={stats.pass} icon="check" caption="2차 안내 예정" />
          <StatCard title="1차 불합격" value={stats.fail} icon="x" caption="감사 메일 대상" />
          <StatCard title="발송 완료" value={stats.sent} icon="send" caption="상태만 표시" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <Card>
            <div className="p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">지원자 목록</h2>
                  <p className="text-sm text-slate-500">행을 클릭하면 오른쪽에서 메일을 확인할 수 있습니다.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Icon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="이름, 이메일, 직무 검색"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  ["all", "전체"],
                  ["pass", "합격"],
                  ["fail", "불합격"],
                  ["previewed", "미리보기 완료"],
                  ["sent", "발송 완료"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${filter === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {filteredApplicants.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="p-3">지원자</th>
                        <th className="hidden p-3 md:table-cell">직무</th>
                        <th className="p-3">결과</th>
                        <th className="p-3">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredApplicants.map((applicant) => {
                        const status = statusMap[applicant.status] || statusMap.draft;
                        const selected = selectedApplicant?.id === applicant.id;
                        return (
                          <tr
                            key={applicant.id}
                            onClick={() => setSelectedId(applicant.id)}
                            className={`cursor-pointer transition hover:bg-blue-50/50 ${selected ? "bg-blue-50" : ""}`}
                          >
                            <td className="p-3 align-top">
                              <div className="font-medium text-slate-900">{applicant.name}</div>
                              <div className="text-xs text-slate-500">{applicant.email}</div>
                              <div className="mt-1 text-xs text-slate-500 md:hidden">{applicant.position}</div>
                              {applicant.edited && <Badge className="mt-1 bg-violet-50 text-violet-700">개별 수정됨</Badge>}
                            </td>
                            <td className="hidden p-3 align-top text-slate-600 md:table-cell">{applicant.position}</td>
                            <td className="p-3 align-top">
                              <select
                                value={applicant.result}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => handleResultChange(applicant.id, event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-blue-400"
                              >
                                <option value="pass">합격</option>
                                <option value="fail">불합격</option>
                              </select>
                            </td>
                            <td className="p-3 align-top">
                              <Badge className={status.className}>
                                <Icon name={status.icon} className="mr-1 h-3.5 w-3.5" />
                                {status.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-5">
              {selectedApplicant ? (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">메일 미리보기</h2>
                      <p className="text-sm text-slate-500">{selectedApplicant.name}님에게 발송될 문구를 확인하세요.</p>
                    </div>
                    <Badge className={selectedApplicant.result === "pass" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}>
                      {selectedApplicant.result === "pass" ? "1차 합격" : "1차 불합격"}
                    </Badge>
                  </div>

                  <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div>
                        <span className="text-slate-400">이름</span>
                        <p className="font-medium">{selectedApplicant.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">지원 직무</span>
                        <p className="font-medium">{selectedApplicant.position}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">이메일</span>
                        <p className="font-medium">{selectedApplicant.email}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">메모</span>
                        <p className="font-medium">{selectedApplicant.memo || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">메일 제목</label>
                  <input
                    value={mail.subject}
                    onChange={(event) => handleSubjectChange(event.target.value)}
                    className="mb-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                  <label className="mb-2 block text-sm font-medium text-slate-700">메일 본문</label>
                  <textarea
                    value={mail.body}
                    onChange={(event) => handleBodyChange(event.target.value)}
                    rows={15}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                  {selectedApplicant.edited && (
                    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-violet-50 p-3 text-sm text-violet-700">
                      <Icon name="save" className="h-4 w-4" /> 이 지원자의 메일 내용이 개별 수정되었습니다.
                    </div>
                  )}

                  <div className="mt-5 grid gap-2 md:grid-cols-3">
                    <Button onClick={handlePreviewComplete} className="bg-blue-600 text-white hover:bg-blue-700">
                      <Icon name="mail" className="mr-2 h-4 w-4" /> 미리보기 완료
                    </Button>
                    <Button onClick={handleQueue} className="bg-amber-500 text-white hover:bg-amber-600">
                      <Icon name="clock" className="mr-2 h-4 w-4" /> 발송 대기
                    </Button>
                    <Button onClick={handleSent} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Icon name="send" className="mr-2 h-4 w-4" /> 발송 완료 처리
                    </Button>
                  </div>

                  {selectedApplicant.sentAt && <p className="mt-3 text-xs text-slate-400">발송 완료 표시 일시: {selectedApplicant.sentAt}</p>}

                  <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                    현재 화면은 디자인 확인용입니다. 버튼을 눌러도 실제 이메일은 발송되지 않습니다.
                  </div>
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </Card>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">기본 설정</h3>
            <p className="mt-1 text-sm text-slate-500">메일 템플릿에 들어갈 기본 정보를 입력하세요.</p>
            <div className="mt-5 space-y-3">
              <input
                value={settings.companyName}
                onChange={(event) => setSettings({ ...settings, companyName: event.target.value })}
                placeholder="회사명"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                value={settings.recruiterName}
                onChange={(event) => setSettings({ ...settings, recruiterName: event.target.value })}
                placeholder="담당자명"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                value={settings.replyEmail}
                onChange={(event) => setSettings({ ...settings, replyEmail: event.target.value })}
                placeholder="회신 이메일"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setShowSettings(false)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                닫기
              </Button>
              <Button
                onClick={() => {
                  setShowSettings(false);
                  showToast("설정이 저장되었습니다.");
                }}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold">지원자 추가</h3>
            <p className="mt-1 text-sm text-slate-500">디자인 확인용 샘플 목록에 지원자를 추가합니다.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <input
                value={newApplicant.name}
                onChange={(event) => setNewApplicant({ ...newApplicant, name: event.target.value })}
                placeholder="이름"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                value={newApplicant.email}
                onChange={(event) => setNewApplicant({ ...newApplicant, email: event.target.value })}
                placeholder="이메일"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                value={newApplicant.position}
                onChange={(event) => setNewApplicant({ ...newApplicant, position: event.target.value })}
                placeholder="지원 직무"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
              <select
                value={newApplicant.result}
                onChange={(event) => setNewApplicant({ ...newApplicant, result: event.target.value })}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="pass">합격</option>
                <option value="fail">불합격</option>
              </select>
              <textarea
                value={newApplicant.memo}
                onChange={(event) => setNewApplicant({ ...newApplicant, memo: event.target.value })}
                placeholder="메모"
                rows={3}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 md:col-span-2"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setShowAddForm(false)} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                취소
              </Button>
              <Button onClick={handleAddApplicant} className="bg-slate-900 text-white hover:bg-slate-800">
                추가
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-slate-950 px-5 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
