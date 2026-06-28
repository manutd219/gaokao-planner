const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const RECORDS_FILE = process.env.RECORDS_FILE || path.join(DATA_DIR, "records.json");
const CALLS_FILE = process.env.CALLS_FILE || path.join(DATA_DIR, "calls.json");
const TEACHER_CALLS_FILE = process.env.TEACHER_CALLS_FILE || path.join(DATA_DIR, "teacher-calls.json");
const PORT = Number(process.env.PORT || 4173);
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_HOURS || 24) * 60 * 60 * 1000;
const NODE_ENV = process.env.NODE_ENV || "development";

const sessions = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const statuses = ["未跟进", "已沟通", "重点跟进", "已报名", "暂不考虑"];

function parseSalesUsers() {
  if (!process.env.SALES_USERS) {
    return [
      {
        username: process.env.SALES_USERNAME || "sales",
        password: process.env.SALES_PASSWORD || "sales123",
        name: process.env.SALES_NAME || "销售",
        role: "sales"
      }
    ];
  }

  try {
    const parsed = JSON.parse(process.env.SALES_USERS);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((user) => user && user.username && user.password)
        .map((user) => ({
          username: String(user.username),
          password: String(user.password),
          name: String(user.name || user.username),
          role: "sales"
        }));
    }
  } catch {}

  return process.env.SALES_USERS.split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [username, password, name] = item.split(":");
      return username && password
        ? { username, password, name: name || username, role: "sales" }
        : null;
    })
    .filter(Boolean);
}

function parseTeacherUsers() {
  if (!process.env.TEACHER_USERS) {
    if (NODE_ENV === "production" && !process.env.TEACHER_USERNAME && !process.env.TEACHER_PASSWORD) return [];
    return [
      {
        username: process.env.TEACHER_USERNAME || "teacher",
        password: process.env.TEACHER_PASSWORD || "teacher123",
        name: process.env.TEACHER_NAME || "主讲",
        role: "teacher"
      }
    ];
  }

  try {
    const parsed = JSON.parse(process.env.TEACHER_USERS);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((user) => user && user.username && user.password)
        .map((user) => ({
          username: String(user.username),
          password: String(user.password),
          name: String(user.name || user.username),
          role: "teacher"
        }));
    }
  } catch {}

  return process.env.TEACHER_USERS.split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [username, password, name] = item.split(":");
      return username && password
        ? { username, password, name: name || username, role: "teacher" }
        : null;
    })
    .filter(Boolean);
}

function getUsers() {
  return [
    {
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "admin123",
      name: process.env.ADMIN_NAME || "管理员",
      role: "admin"
    },
    ...parseSalesUsers(),
    ...parseTeacherUsers()
  ];
}

function demoMode() {
  return NODE_ENV !== "production"
    && !process.env.ADMIN_PASSWORD
    && !process.env.SALES_USERS
    && !process.env.SALES_PASSWORD
    && !process.env.TEACHER_USERS
    && !process.env.TEACHER_PASSWORD;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("请求内容不是有效 JSON");
    error.statusCode = 400;
    throw error;
  }
}

async function ensureJsonFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n", "utf8");
  }
}

async function readJsonArray(filePath) {
  await ensureJsonFile(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

async function writeJsonArray(filePath, records) {
  await ensureJsonFile(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

async function readRecords() {
  return readJsonArray(RECORDS_FILE);
}

async function writeRecords(records) {
  return writeJsonArray(RECORDS_FILE, records);
}

async function readCallRecords() {
  return readJsonArray(CALLS_FILE);
}

async function writeCallRecords(records) {
  return writeJsonArray(CALLS_FILE, records);
}

async function readTeacherCallRecords() {
  return readJsonArray(TEACHER_CALLS_FILE);
}

async function writeTeacherCallRecords(records) {
  return writeJsonArray(TEACHER_CALLS_FILE, records);
}

function publicUser(user) {
  return {
    username: user.username,
    name: user.name,
    role: user.role
  };
}

function cleanupSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) sessions.delete(token);
  }
}

function getSessionUser(req) {
  cleanupSessions();
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  return session.user;
}

function requireUser(req, res) {
  const user = getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: "请先登录" });
    return null;
  }
  return user;
}

function sanitizeRecord(body, user) {
  const form = body.form && typeof body.form === "object" ? body.form : {};
  const analysis = body.analysis && typeof body.analysis === "object" ? body.analysis : {};
  const subjects = Array.isArray(body.subjects) ? body.subjects : [];
  const salesTalk = Array.isArray(body.salesTalk) ? body.salesTalk : [];
  const callContext = body.callContext && typeof body.callContext === "object" ? body.callContext : null;
  const sourceCallId = typeof body.sourceCallId === "string" ? body.sourceCallId : "";
  const status = statuses.includes(body.status) ? body.status : "未跟进";

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: publicUser(user),
    status,
    form,
    analysis,
    subjects,
    salesTalk,
    callContext,
    sourceCallId
  };
}

function sanitizeCallRecord(body, user, existing = null) {
  const call = body.call && typeof body.call === "object" ? body.call : {};
  const analysis = body.analysis && typeof body.analysis === "object" ? { ...body.analysis } : {};
  delete analysis.nextLine;
  const now = new Date().toISOString();
  const status = existing?.status || (statuses.includes(body.status) ? body.status : "未跟进");
  return {
    id: existing?.id || randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    owner: publicUser(user),
    status,
    call,
    analysis
  };
}

function sanitizeTeacherCallRecord(body, user, existing = null) {
  const teacher = body.teacher && typeof body.teacher === "object" ? body.teacher : {};
  const report = body.report && typeof body.report === "object" ? body.report : {};
  const sourceSalesCall = body.sourceSalesCall && typeof body.sourceSalesCall === "object" ? body.sourceSalesCall : null;
  const now = new Date().toISOString();
  const status = String(body.status || existing?.status || "待沟通").trim() || "待沟通";
  return {
    id: existing?.id || randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    owner: publicUser(user),
    status,
    studentName: String(teacher.studentName || body.studentName || "").trim(),
    teacher,
    report,
    sourceSalesCallId: String(body.sourceSalesCallId || sourceSalesCall?.id || existing?.sourceSalesCallId || ""),
    sourceSalesCall
  };
}

function visibleRecords(records, user) {
  return user.role === "admin"
    ? records
    : records.filter((record) => record.owner && record.owner.username === user.username);
}

function visibleTeacherCallRecords(records, user) {
  return user.role === "admin"
    ? records
    : records.filter((record) => record.owner && record.owner.username === user.username);
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function nameMatches(value, keyword) {
  const name = normalizeName(value);
  const query = normalizeName(keyword);
  return Boolean(query && (name === query || name.includes(query)));
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    sendJson(res, 403, { error: "只有管理员可以查看后台数据" });
    return null;
  }
  return user;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function recordsToCsv(records) {
  const rows = [
    ["保存时间", "销售", "学生", "省份", "城市", "目标高中", "中考总分", "高考层次预估", "暑假重点", "补充信息", "状态"],
    ...records.map((record) => {
      const form = record.form || {};
      const analysis = record.analysis || {};
      return [
        record.createdAt,
        record.owner?.name || "",
        form.name || "",
        form.province || "",
        form.city || "",
        form.school || "",
        analysis.total ? `${analysis.total}/${analysis.totalMax || ""}` : form.totalManual || "",
        analysis.gaokaoLevel || "",
        analysis.summerFocus || "",
        form.notes || "",
        record.status || ""
      ];
    })
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function customerTierLabel(record) {
  const level = record.analysis?.customerLevel;
  if (level && typeof level === "object") return String(level.label || "");
  return String(level || record.analysis?.profile || "");
}

function customerTierCode(record) {
  const label = customerTierLabel(record);
  const matched = label.match(/^[ABCD]/i);
  return matched ? matched[0].toUpperCase() : "pending";
}

function trackedSubjects(record) {
  const saved = record.analysis?.trackedSubjects;
  if (Array.isArray(saved) && saved.length) return saved;
  const call = record.call || {};
  const selected = Array.isArray(call.subjects) ? call.subjects.filter((item) => item && !String(item).includes("暂不确定")) : [];
  if (selected.length) return selected;
  const problems = Array.isArray(call.problems) ? call.problems.join(" ") : "";
  return ["语文", "数学", "英语", "物理", "化学", "历史"]
    .filter((subject) => problems.includes(subject));
}

function callsToCsv(records) {
  const rows = [
    ["更新时间", "销售账号", "销售姓名", "学生", "性别", "省份", "城市", "区县", "阶段", "升学路径", "目标高中", "总分", "各科成绩", "客户分层", "分层依据", "家长关注", "孩子问题", "跟踪学科", "补习经历", "异议", "下一步动作", "推荐主讲", "沟通对象", "家长原话", "销售备注", "学情摘要", "状态"],
    ...records.map((record) => {
      const call = record.call || {};
      const scores = call.scores || {};
      const level = record.analysis?.customerLevel;
      const subjectScores = [
        ["语文", scores.chinese], ["数学", scores.math], ["英语", scores.english],
        ["物理", scores.physics], ["化学", scores.chemistry], ["历史", scores.history]
      ].filter(([, value]) => value !== "" && value !== undefined).map(([name, value]) => `${name}${value}`).join("、");
      return [
        record.updatedAt || record.createdAt,
        record.owner?.username || "",
        record.owner?.name || "",
        call.studentName || "",
        call.gender || "",
        call.province || "",
        call.city || "",
        call.district || "",
        call.stage || "",
        call.pathway || "",
        call.school || "",
        scores.total || "",
        subjectScores,
        customerTierLabel(record),
        level && typeof level === "object" ? level.reason || "" : "",
        Array.isArray(call.concern) ? call.concern.join("、") : "",
        Array.isArray(call.problems) ? call.problems.join("、") : "",
        trackedSubjects(record).join("、"),
        Array.isArray(call.tutoring) ? call.tutoring.join("、") : "",
        Array.isArray(call.objections) ? call.objections.join("、") : "",
        Array.isArray(call.next) ? call.next.join("、") : "",
        record.analysis?.teacher || "",
        call.decision || call.teacherTarget || "",
        call.quotes || "",
        call.notes || "",
        record.analysis?.report || "",
        record.status || ""
      ];
    })
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function teacherCallsToCsv(records) {
  const rows = [
    ["更新时间", "主讲账号", "主讲姓名", "学生", "地区", "主讲学科", "沟通对象", "诊断重点", "意向度", "主讲记录", "诊断报告", "来源销售记录", "状态"],
    ...records.map((record) => {
      const teacher = record.teacher || {};
      const report = record.report || {};
      return [
        record.updatedAt || record.createdAt,
        record.owner?.username || "",
        record.owner?.name || "",
        record.studentName || teacher.studentName || "",
        teacher.region || "",
        teacher.subject || "",
        teacher.audience || "",
        teacher.focus || "",
        teacher.intent || "",
        teacher.summary || "",
        report.diagnosis || "",
        record.sourceSalesCallId || "",
        record.status || ""
      ];
    })
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function findStudentProfiles(name, planningRecords, callRecords, teacherCallRecords) {
  const planning = planningRecords
    .filter((record) => nameMatches(record.form?.name, name))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const salesCalls = callRecords
    .filter((record) => nameMatches(record.call?.studentName, name))
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const teacherCalls = teacherCallRecords
    .filter((record) => nameMatches(record.studentName || record.teacher?.studentName, name))
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  return { planning, salesCalls, teacherCalls };
}

function latestByTime(records, timeField = "updatedAt") {
  return [...records].sort((a, b) => String(b[timeField] || b.createdAt).localeCompare(String(a[timeField] || a.createdAt)))[0] || null;
}

function collectStudentNames(planningRecords, callRecords, teacherCallRecords) {
  const names = new Set();
  planningRecords.forEach((record) => {
    const name = String(record.form?.name || "").trim();
    if (name) names.add(name);
  });
  callRecords.forEach((record) => {
    const name = String(record.call?.studentName || "").trim();
    if (name) names.add(name);
  });
  teacherCallRecords.forEach((record) => {
    const name = String(record.studentName || record.teacher?.studentName || "").trim();
    if (name) names.add(name);
  });
  return [...names];
}

function buildUserDashboardRows(planningRecords, callRecords, teacherCallRecords) {
  return collectStudentNames(planningRecords, callRecords, teacherCallRecords).map((name) => {
    const profile = findStudentProfiles(name, planningRecords, callRecords, teacherCallRecords);
    const latestPlan = latestByTime(profile.planning, "createdAt");
    const latestSales = latestByTime(profile.salesCalls);
    const latestTeacher = latestByTime(profile.teacherCalls);
    const form = latestPlan?.form || {};
    const analysis = latestPlan?.analysis || {};
    const call = latestSales?.call || {};
    const teacher = latestTeacher?.teacher || {};
    const level = latestSales ? customerTierLabel(latestSales) : "";
    const updatedAt = [latestPlan?.updatedAt || latestPlan?.createdAt, latestSales?.updatedAt || latestSales?.createdAt, latestTeacher?.updatedAt || latestTeacher?.createdAt]
      .filter(Boolean)
      .sort()
      .pop() || "";
    return {
      studentName: name,
      updatedAt,
      province: form.province || call.province || "",
      city: form.city || call.city || "",
      planningCount: profile.planning.length,
      salesCount: profile.salesCalls.length,
      teacherCount: profile.teacherCalls.length,
      salesOwner: latestSales?.owner || null,
      teacherOwner: latestTeacher?.owner || null,
      customerLevel: level,
      customerTier: latestSales ? customerTierCode(latestSales) : "",
      trackedSubjects: latestSales ? trackedSubjects(latestSales) : [],
      gaokaoLevel: analysis.gaokaoLevel || "",
      totalScore: analysis.total ? `${analysis.total}/${analysis.totalMax || ""}` : (form.totalManual || call.scores?.total || ""),
      summerFocus: analysis.summerFocus || "",
      salesSummary: latestSales?.analysis?.report || call.quotes || "",
      teacherSummary: teacher.summary || "",
      teacherReport: latestTeacher?.report?.diagnosis || ""
    };
  }).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function filterUserDashboardRows(rows, url) {
  const sales = String(url.searchParams.get("sales") || "");
  const teacher = String(url.searchParams.get("teacher") || "");
  const tier = String(url.searchParams.get("tier") || "");
  return rows
    .filter((row) => !sales || row.salesOwner?.username === sales)
    .filter((row) => !teacher || row.teacherOwner?.username === teacher)
    .filter((row) => !tier || row.customerTier === tier);
}

function userDashboardToCsv(rows) {
  const csvRows = [
    ["更新时间", "学生", "地区", "销售账号", "主讲账号", "客户分层", "跟踪学科", "规划记录数", "销售记录数", "主讲记录数", "中考总分", "高考层次", "暑假重点", "销售摘要", "主讲记录", "主讲诊断报告"],
    ...rows.map((row) => [
      row.updatedAt,
      row.studentName,
      [row.province, row.city].filter(Boolean).join(" "),
      row.salesOwner?.username || "",
      row.teacherOwner?.username || "",
      row.customerLevel || "",
      row.trackedSubjects.join("、"),
      row.planningCount,
      row.salesCount,
      row.teacherCount,
      row.totalScore,
      row.gaokaoLevel,
      row.summerFocus,
      row.salesSummary,
      row.teacherSummary,
      row.teacherReport
    ])
  ];
  return csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "gaokao-planner", time: new Date().toISOString() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    sendJson(res, 200, {
      demoMode: demoMode(),
      loginHint: demoMode()
        ? "测试账号：sales / sales123；teacher / teacher123；管理员：admin / admin123"
        : "请输入管理员分配的账号。"
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const user = getUsers().find((item) => item.username === username && item.password === password);
    if (!user) {
      sendJson(res, 401, { error: "账号或密码不正确" });
      return;
    }
    const token = randomUUID();
    sessions.set(token, {
      user,
      expiresAt: Date.now() + SESSION_TTL_MS
    });
    sendJson(res, 200, { token, user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token) sessions.delete(token);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/me") {
    const user = requireUser(req, res);
    if (!user) return;
    sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/calls") {
    const user = requireUser(req, res);
    if (!user) return;
    const records = visibleRecords(await readCallRecords(), user)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
    sendJson(res, 200, { records });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/calls/export") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const sales = String(url.searchParams.get("sales") || "");
    const tier = String(url.searchParams.get("tier") || "");
    const records = visibleRecords(await readCallRecords(), user)
      .filter((record) => !sales || record.owner?.username === sales)
      .filter((record) => !tier || customerTierCode(record) === tier)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=call-records.csv"
    });
    res.end(`\uFEFF${callsToCsv(records)}`);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/calls") {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readBody(req);
    const records = await readCallRecords();
    const studentName = String(body.call?.studentName || "").trim().toLowerCase();
    if (!studentName) {
      sendJson(res, 400, { error: "请先填写学生姓名，再复制学情摘要" });
      return;
    }
    const index = records.findIndex((record) => (
      record.owner?.username === user.username
      && String(record.call?.studentName || "").trim().toLowerCase() === studentName
    ));
    const existing = index >= 0 ? records[index] : null;
    const record = sanitizeCallRecord(body, user, existing);
    if (index >= 0) records[index] = record;
    else records.push(record);
    await writeCallRecords(records);
    sendJson(res, existing ? 200 : 201, { record, updated: Boolean(existing) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/teacher-calls") {
    const user = requireUser(req, res);
    if (!user) return;
    const records = visibleTeacherCallRecords(await readTeacherCallRecords(), user)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
    sendJson(res, 200, { records });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/teacher-calls/export") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const teacher = String(url.searchParams.get("teacher") || "");
    const subject = String(url.searchParams.get("subject") || "");
    const records = visibleTeacherCallRecords(await readTeacherCallRecords(), user)
      .filter((record) => !teacher || record.owner?.username === teacher)
      .filter((record) => !subject || record.teacher?.subject === subject)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=teacher-call-records.csv"
    });
    res.end(`\uFEFF${teacherCallsToCsv(records)}`);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/teacher-calls") {
    const user = requireUser(req, res);
    if (!user) return;
    if (!["admin", "teacher"].includes(user.role)) {
      sendJson(res, 403, { error: "只有主讲或管理员可以保存主讲外呼记录" });
      return;
    }
    const body = await readBody(req);
    const records = await readTeacherCallRecords();
    const studentName = String(body.teacher?.studentName || body.studentName || "").trim().toLowerCase();
    if (!studentName) {
      sendJson(res, 400, { error: "请先填写学生姓名，再保存主讲记录" });
      return;
    }
    const index = records.findIndex((record) => (
      record.owner?.username === user.username
      && String(record.studentName || record.teacher?.studentName || "").trim().toLowerCase() === studentName
    ));
    const existing = index >= 0 ? records[index] : null;
    const record = sanitizeTeacherCallRecord(body, user, existing);
    if (index >= 0) records[index] = record;
    else records.push(record);
    await writeTeacherCallRecords(records);
    sendJson(res, existing ? 200 : 201, { record, updated: Boolean(existing) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/student-profile") {
    const user = requireUser(req, res);
    if (!user) return;
    const name = String(url.searchParams.get("name") || "").trim();
    if (!name) {
      sendJson(res, 400, { error: "请输入学生姓名" });
      return;
    }
    const planningRecords = await readRecords();
    const callRecords = await readCallRecords();
    const teacherCallRecords = await readTeacherCallRecords();
    const profile = findStudentProfiles(name, planningRecords, callRecords, teacherCallRecords);
    sendJson(res, 200, { name, ...profile });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/user-dashboard") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const rows = filterUserDashboardRows(buildUserDashboardRows(
      await readRecords(),
      await readCallRecords(),
      await readTeacherCallRecords()
    ), url);
    sendJson(res, 200, { rows });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/user-dashboard/export") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const rows = filterUserDashboardRows(buildUserDashboardRows(
      await readRecords(),
      await readCallRecords(),
      await readTeacherCallRecords()
    ), url);
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=user-dashboard.csv"
    });
    res.end(`\uFEFF${userDashboardToCsv(rows)}`);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/records/export") {
    const user = requireAdmin(req, res);
    if (!user) return;
    const records = visibleRecords(await readRecords(), user)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": "attachment; filename=records.csv"
    });
    res.end(`\uFEFF${recordsToCsv(records)}`);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/records") {
    const user = requireUser(req, res);
    if (!user) return;
    const records = visibleRecords(await readRecords(), user)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    sendJson(res, 200, { records });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/records") {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readBody(req);
    const record = sanitizeRecord(body, user);
    const records = await readRecords();
    records.push(record);
    await writeRecords(records);
    sendJson(res, 201, { record });
    return;
  }

  const match = url.pathname.match(/^\/api\/records\/([^/]+)$/);
  if (req.method === "PATCH" && match) {
    const user = requireAdmin(req, res);
    if (!user) return;
    const body = await readBody(req);
    const records = await readRecords();
    const index = records.findIndex((record) => record.id === match[1]);
    if (index === -1) {
      sendJson(res, 404, { error: "记录不存在" });
      return;
    }
    const record = records[index];
    const canEdit = user.role === "admin" || (record.owner && record.owner.username === user.username);
    if (!canEdit) {
      sendJson(res, 403, { error: "没有权限修改这条记录" });
      return;
    }
    if (statuses.includes(body.status)) record.status = body.status;
    record.updatedAt = new Date().toISOString();
    records[index] = record;
    await writeRecords(records);
    sendJson(res, 200, { record });
    return;
  }

  sendJson(res, 404, { error: "接口不存在" });
}

async function serveStatic(req, res, url) {
  if (url.pathname === "/teacher-call-panel/") {
    res.writeHead(308, { Location: "/teacher-call-panel" });
    res.end();
    return;
  }
  const requested = url.pathname === "/"
    ? "/index.html"
    : url.pathname === "/teacher-call-panel"
      ? "/主讲外呼看板.html"
      : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
    });
    res.end(data);
  } catch {
    sendText(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.message || "服务异常" });
  }
});

server.listen(PORT, () => {
  console.log(`server running at http://127.0.0.1:${PORT}/index.html`);
});
