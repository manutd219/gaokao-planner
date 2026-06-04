const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const RECORDS_FILE = process.env.RECORDS_FILE || path.join(DATA_DIR, "records.json");
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

function getUsers() {
  return [
    {
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "admin123",
      name: process.env.ADMIN_NAME || "管理员",
      role: "admin"
    },
    ...parseSalesUsers()
  ];
}

function demoMode() {
  return NODE_ENV !== "production"
    && !process.env.ADMIN_PASSWORD
    && !process.env.SALES_USERS
    && !process.env.SALES_PASSWORD;
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

async function ensureRecordsFile() {
  await fs.mkdir(path.dirname(RECORDS_FILE), { recursive: true });
  try {
    await fs.access(RECORDS_FILE);
  } catch {
    await fs.writeFile(RECORDS_FILE, "[]\n", "utf8");
  }
}

async function readRecords() {
  await ensureRecordsFile();
  const raw = await fs.readFile(RECORDS_FILE, "utf8");
  try {
    const records = JSON.parse(raw);
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

async function writeRecords(records) {
  await ensureRecordsFile();
  await fs.writeFile(RECORDS_FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");
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
    salesTalk
  };
}

function visibleRecords(records, user) {
  return user.role === "admin"
    ? records
    : records.filter((record) => record.owner && record.owner.username === user.username);
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

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "gaokao-planner", time: new Date().toISOString() });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    sendJson(res, 200, {
      demoMode: demoMode(),
      loginHint: demoMode()
        ? "测试账号：sales / sales123；管理员：admin / admin123"
        : "请输入管理员分配的销售账号。"
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

  if (req.method === "GET" && url.pathname === "/api/records/export") {
    const user = requireUser(req, res);
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
    const user = requireUser(req, res);
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
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
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
