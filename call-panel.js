const callFieldIds = [
  "StudentName", "Gender", "Province", "City", "District", "Stage", "Decision", "Pathway", "School",
  "PolicyAwareness", "MajorAwareness", "ScoreTotal", "ScoreChinese", "ScoreMath", "ScoreEnglish",
  "ScorePhysics", "ScoreChemistry", "ScoreHistory", "Rank", "ScoreNote", "Quotes", "Notes",
  "TeacherSubject", "TeacherTarget", "TeacherFocus"
];

function callNode(suffix) {
  return document.querySelector(`#call${suffix}`);
}

function callSelected(group) {
  return [...document.querySelectorAll(`[data-call-group="${group}"] .call-chip.selected`)]
    .map((node) => node.textContent.trim());
}

function callHas(group, words) {
  return callSelected(group).some((value) => words.some((word) => value.includes(word)));
}

function getCallState() {
  return {
    studentName: callNode("StudentName")?.value.trim() || "",
    gender: callNode("Gender")?.value || "",
    province: callNode("Province")?.value || "",
    city: callNode("City")?.value || "",
    district: callNode("District")?.value.trim() || "",
    stage: callNode("Stage")?.value || "",
    decision: callNode("Decision")?.value || "",
    pathway: callNode("Pathway")?.value || "",
    school: callNode("School")?.value.trim() || "",
    policyAwareness: callNode("PolicyAwareness")?.value || "",
    majorAwareness: callNode("MajorAwareness")?.value || "",
    scores: {
      total: callNode("ScoreTotal")?.value || "",
      chinese: callNode("ScoreChinese")?.value || "",
      math: callNode("ScoreMath")?.value || "",
      english: callNode("ScoreEnglish")?.value || "",
      physics: callNode("ScorePhysics")?.value || "",
      chemistry: callNode("ScoreChemistry")?.value || "",
      history: callNode("ScoreHistory")?.value || "",
      rank: callNode("Rank")?.value || ""
    },
    scoreNote: callNode("ScoreNote")?.value.trim() || "",
    quotes: callNode("Quotes")?.value.trim() || "",
    notes: callNode("Notes")?.value.trim() || "",
    reason: callSelected("reason"),
    concern: callSelected("concern"),
    problems: callSelected("problems"),
    subjects: callSelected("subjects"),
    tutoring: callSelected("tutoring"),
    tutoringRhythm: callSelected("tutoringRhythm"),
    objections: callSelected("objections"),
    next: callSelected("next"),
    teacherSubject: callNode("TeacherSubject")?.value || "",
    teacherTarget: callNode("TeacherTarget")?.value || "",
    teacherFocus: callNode("TeacherFocus")?.value.trim() || ""
  };
}

function callGaokaoMode(province) {
  if (!province) return "高考模式待确认";
  if (provinceModes["3+3"].includes(province)) return `${province} 3+3 新高考`;
  if (provinceModes["3+1+2"].includes(province)) return `${province} 3+1+2 新高考`;
  return `${province}高考口径需按最新政策确认`;
}

function callScoreSummary(state) {
  const names = { chinese: "语文", math: "数学", english: "英语", physics: "物理", chemistry: "化学", history: "历史" };
  const parts = Object.entries(names)
    .filter(([key]) => state.scores[key])
    .map(([key, name]) => `${name}${state.scores[key]}分`);
  const total = state.scores.total ? `总分${state.scores.total}` : "总分未记录";
  const rank = state.scores.rank ? `，位次${state.scores.rank}` : "";
  return `${total}${rank}${parts.length ? `；${parts.join("、")}` : ""}`;
}

function callCommunicationProfile(state) {
  if (state.concern.some((item) => item.includes("规划型"))) return { type: "理性规划型", cue: "少讲笼统结论，先给地区规则、目标路径和下一步检查表。" };
  if (state.concern.some((item) => item.includes("效果型") || item.includes("比较型"))) return { type: "证据验证型", cue: "先复盘成绩和过往补习效果，再用诊断或体验结果证明，不要先堆产品卖点。" };
  if (state.concern.some((item) => item.includes("状态型") || item.includes("安全型"))) return { type: "共情稳妥型", cue: "先承认家长管教压力，围绕孩子能接受的最小任务推进，避免指责和强压。" };
  if (state.concern.some((item) => item.includes("安排型"))) return { type: "执行确认型", cue: "先把时间、形式、回放和后续动作说清，再进入学习必要性。" };
  return { type: "信息待确认型", cue: "先确认家长最在意的是成绩、规划、孩子状态还是课程安排。" };
}

function callTeacher(state) {
  if (state.teacherSubject) return state.teacherSubject;
  if (state.problems.some((item) => /不愿学|沉迷游戏|家长管不动|自驱|目标/.test(item))) return "学习规划老师";
  if (state.subjects.includes("英语") || state.problems.includes("英语断层")) return "英语主讲";
  if (state.subjects.includes("数学") || state.problems.includes("数学薄弱")) return "数学主讲";
  if (state.subjects.includes("物理") || state.problems.includes("物理薄弱")) return "物理主讲";
  if (state.subjects.includes("化学") || state.problems.includes("化学薄弱")) return "化学主讲";
  return "学习规划老师或对应学科主讲";
}

function callNextLine(state) {
  if (!state.province) return "先确认孩子后面在哪个省参加高考，后续选科和高中衔接必须按当地规则判断。";
  if (!state.stage) return "先确认孩子是中考前、已考完、等成绩，还是已经确定高中。";
  if (state.objections.includes("中考还没结束")) return "理解目前先以中考为主，我先不展开课程，考后再按成绩和目标高中做一次衔接判断。";
  if (state.problems.some((item) => /不愿学|沉迷游戏|家长管不动/.test(item)) || state.objections.includes("孩子不配合")) {
    return "我先不把孩子定义成不想学，想确认他是基础挫败后回避，还是目前没有一个愿意配合的具体目标？";
  }
  if (state.objections.includes("线上效果顾虑")) return "您之前线上学习最不满意的是互动、答疑、作业反馈，还是孩子根本没有参与进去？";
  if (state.problems.includes("英语断层")) return "英语目前更像是词汇、语法还是阅读跟不上？我先判断断层发生在哪一层。";
  if (state.subjects.some((item) => /数理化|物化|物理|化学/.test(item))) return "如果后面倾向理科方向，您更担心数学方法，还是物理化学进入高中后听不懂？";
  return "您现在最担心的是孩子进不了目标高中，还是进入高中以后跟不上？";
}

function callProductAdvice(state) {
  const focus = state.subjects.join("、") || state.problems.filter((item) => /数学|物理|化学|英语/.test(item)).join("、") || "核心学科";
  if (state.province === "广东" && state.city === "深圳" && !state.objections.includes("线上效果顾虑")) {
    return `可优先评估深圳线下初升高9人小班，用${focus}诊断确认福田/南山校区和科目组合；先诊断再推荐，不直接推三科。`;
  }
  const objection = state.objections.includes("线上效果顾虑")
    ? "家长对线上效果有顾虑，应先复盘原课程的互动、答疑、作业和反馈哪个环节失效，再用体验过程验证。"
    : "需要先确认孩子的互动意愿、设备环境和课后任务完成度。";
  return `可评估线上初升高12人小班，重点科目为${focus}。${objection}`;
}

function callMissing(state) {
  const missing = [];
  if (!state.studentName) missing.push("学生姓名");
  if (!state.province) missing.push("省份");
  if (state.province && !state.city) missing.push("城市");
  if (!state.stage) missing.push("孩子阶段");
  if (!state.scores.total && !Object.values(state.scores).some(Boolean)) missing.push("成绩或位次");
  if (!state.quotes) missing.push("家长原话");
  if (!state.concern.length) missing.push("家长关注点");
  return missing;
}

function buildCallAnalysis(state) {
  const profile = callCommunicationProfile(state);
  const teacher = callTeacher(state);
  const stateText = state.problems.length ? state.problems.join("、") : "孩子学习状态尚未补齐";
  const learning = state.problems.some((item) => /不愿学|沉迷游戏|自驱|目标/.test(item))
    ? "当前主要矛盾不只是知识，而是孩子能否开始并持续完成任务。建议先设一个7天可验证目标，再决定课程强度。"
    : `当前主要依据为${callScoreSummary(state)}。需要用具体题目继续判断是基础、方法还是训练量问题。`;
  const tutoring = state.tutoring.length
    ? `过往补习：${state.tutoring.join("、")}；节奏：${state.tutoringRhythm.join("、") || "未确认"}。后续要追问原方案在哪个环节失效。`
    : "补习经历尚未确认，不能只按线上或线下形式判断适配度。";
  const sections = [
    ["综合判断", `${profile.type}。${profile.cue} 当前标签：${stateText}。`],
    ["孩子学习状态", learning],
    ["既往补习与班型", tutoring],
    ["新高考与地区", `${callGaokaoMode(state.province)}。家长政策认知：${state.policyAwareness || "未确认"}；选科与专业认知：${state.majorAwareness || "未确认"}。精确位次和批次线进入规划页后按数据库口径生成。`],
    ["差异化沟通策略", `${profile.cue} 当前建议下一句：${callNextLine(state)}`],
    ["产品与主讲承接", `${callProductAdvice(state)} 建议由${teacher}承接，并留下题目反馈、7天任务或体验观察点。`]
  ];
  return { profile, teacher, sections };
}

function buildCallReport(state) {
  const analysis = buildCallAnalysis(state);
  const location = [state.province, state.city, state.district].filter(Boolean).join(" ") || "未确认";
  return `【外呼学情摘要｜内部使用】\n\n学生：${state.studentName || "未记录"}；地区：${location}\n阶段：${state.stage || "未确认"}；目标：${state.school || state.pathway || "未确认"}\n成绩：${callScoreSummary(state)}\n重点学科：${state.subjects.join("、") || "未确认"}\n孩子状态：${state.problems.join("、") || "未记录"}\n家长关注：${state.concern.join("、") || "未记录"}\n补习经历：${state.tutoring.join("、") || "未确认"}\n阻力异议：${state.objections.join("、") || "未记录"}\n沟通对象：${state.decision || "未确认"}\n家长原话：${state.quotes || "未记录"}\n销售备注：${state.notes || "无"}\n建议主讲：${analysis.teacher}\n主讲重点：${state.teacherFocus || "结合薄弱学科、既往补习效果和配合度，判断暑假最该解决基础、方法还是高一适应。"}\n下一步：${state.next.join("、") || callNextLine(state)}`;
}

function buildCallWechat(state) {
  const teacher = callTeacher(state);
  if (state.problems.some((item) => /不愿学|沉迷游戏|家长管不动/.test(item))) return `我刚才听下来，孩子当前最需要先判断的是学习意愿和可执行目标。后面建议让${teacher}和您或孩子简单沟通，先确定一个孩子愿意配合的暑假起点。`;
  if (state.objections.includes("线上效果顾虑")) return `您提到之前对线上效果有顾虑，我已经记下来了。后面我们不先谈形式，先用一次具体互动和题目反馈，看孩子是否真正参与、老师能否发现问题，再判断是否适合。`;
  const focus = state.subjects.join("、") || "核心学科";
  return `我已经把孩子的地区、成绩和${focus}情况记下来了。后面会结合高中衔接和当地新高考要求，先判断暑假最该处理哪一两科，再给您一个更具体的安排。`;
}

function renderCallPanel() {
  if (!callNode("StudentName")) return;
  const state = getCallState();
  const analysis = buildCallAnalysis(state);
  const missing = callMissing(state);
  const evidence = [callGaokaoMode(state.province), state.stage || "阶段未确认", state.concern[0] || "关注点未确认"].join("；");
  callNode("CurrentJudgment").textContent = `${analysis.profile.type}；${evidence}`;
  callNode("NextLine").textContent = callNextLine(state);
  callNode("TeacherLine").textContent = `${analysis.teacher}；建议沟通对象：${state.teacherTarget || state.decision || "优先家长+孩子"}`;
  callNode("Missing").textContent = missing.length ? missing.join("、") : "关键信息基本完整，可以生成学情规划。";
  callNode("ProvinceAdvice").innerHTML = `<strong>地区判断</strong><p>${callGaokaoMode(state.province)}。选科建议必须结合目标专业、优势科目和学习成本，具体批次线及位次进入规划页后生成。</p>`;
  callNode("SubjectAdvice").innerHTML = `<strong>学科判断</strong><p>${state.subjects.length ? `重点关注${state.subjects.join("、")}。` : "重点学科尚未确认。"}${state.problems.length ? ` 当前问题：${state.problems.join("、")}。` : " 建议补充具体错题或单科成绩。"}</p>`;
  callNode("WechatText").textContent = buildCallWechat(state);
  callNode("Report").textContent = buildCallReport(state);
  callNode("AnalysisReport").innerHTML = analysis.sections.map(([title, copy]) => `<section class="call-analysis-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></section>`).join("");
}

function populateCallCities(selectedCity = "") {
  const province = callNode("Province").value;
  const cities = cityOptions[province] || [];
  callNode("City").innerHTML = `<option value="">请选择城市</option>${cities.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join("")}`;
  if (selectedCity && cities.some((item) => item.name === selectedCity)) callNode("City").value = selectedCity;
}

function setCallMessage(text) {
  if (callNode("Message")) callNode("Message").textContent = text;
}

async function copyCallText(text, message) {
  await navigator.clipboard.writeText(text);
  setCallMessage(message);
}

function resetCallPanel() {
  callFieldIds.forEach((suffix) => {
    const node = callNode(suffix);
    if (!node) return;
    if (node.tagName === "SELECT") node.selectedIndex = 0;
    else node.value = "";
  });
  document.querySelectorAll(".call-chip.selected").forEach((node) => node.classList.remove("selected"));
  populateCallCities();
  currentSourceCallId = "";
  latestCallContext = null;
  setCallMessage("已清空当前记录。");
  renderCallPanel();
}

async function saveCallRecord(options = {}) {
  if (!currentUser) throw new Error("请先登录销售账号");
  const state = getCallState();
  if (!state.studentName || !state.province || !state.city) throw new Error("请先填写学生姓名、省份和城市");
  const analysis = buildCallAnalysis(state);
  const payload = await apiFetch("/api/calls", {
    method: "POST",
    body: JSON.stringify({ status: "未跟进", call: state, analysis: { profile: analysis.profile.type, teacher: analysis.teacher, report: buildCallReport(state) } })
  });
  if (payload.record) {
    allCallRecords = [payload.record, ...allCallRecords.filter((record) => record.id !== payload.record.id)];
    currentSourceCallId = payload.record.id;
    latestCallContext = state;
    renderCallRecentSelector();
  }
  if (!options.silent) setCallMessage(`已保存${state.studentName}的外呼记录。`);
  return payload.record;
}

async function loadCallRecords() {
  if (!currentUser) {
    allCallRecords = [];
    renderCallRecentSelector();
    renderAdminCallRecords();
    return;
  }
  try {
    const payload = await apiFetch("/api/calls");
    allCallRecords = payload.records || [];
    renderCallSalesFilter();
    renderCallRecentSelector();
    renderAdminCallRecords();
  } catch (error) {
    setCallMessage(error.message);
  }
}

function callCustomerLevel(record) {
  const level = record.analysis?.customerLevel;
  if (level && typeof level === "object") return level;
  const label = String(level || record.analysis?.profile || "待判断：信息不足");
  return { label, reason: "" };
}

function callTierCode(record) {
  const matched = callCustomerLevel(record).label.match(/^[ABCD]/i);
  return matched ? matched[0].toUpperCase() : "pending";
}

function callTrackedSubjects(record) {
  const saved = record.analysis?.trackedSubjects;
  if (Array.isArray(saved) && saved.length) return saved;
  const state = record.call || {};
  const selected = Array.isArray(state.subjects)
    ? state.subjects.filter((item) => item && !String(item).includes("暂不确定"))
    : [];
  if (selected.length) return selected;
  const problems = Array.isArray(state.problems) ? state.problems.join(" ") : "";
  return ["语文", "数学", "英语", "物理", "化学", "历史"].filter((item) => problems.includes(item));
}

function renderCallSalesFilter() {
  const select = document.querySelector("#callSalesFilter");
  if (!select) return;
  const selected = select.value;
  const owners = new Map();
  allCallRecords.forEach((record) => {
    const username = record.owner?.username;
    if (username) owners.set(username, record.owner?.name || username);
  });
  select.innerHTML = `<option value="">全部销售</option>${[...owners.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "zh-CN"))
    .map(([username, name]) => `<option value="${escapeHtml(username)}">${escapeHtml(username)} · ${escapeHtml(name)}</option>`)
    .join("")}`;
  if (owners.has(selected)) select.value = selected;
}

function filteredCallRecords() {
  const sales = document.querySelector("#callSalesFilter")?.value || "";
  const tier = document.querySelector("#callTierFilter")?.value || "";
  return [...allCallRecords]
    .filter((record) => !sales || record.owner?.username === sales)
    .filter((record) => !tier || callTierCode(record) === tier)
    .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
}

function callRecordLabel(record) {
  const state = record.call || {};
  return `${state.studentName || "未命名学生"} · ${[state.province, state.city].filter(Boolean).join("-") || "未填地区"} · ${state.scores?.total || "未填总分"} · ${formatTime(record.createdAt)}`;
}

function renderCallRecentSelector() {
  const select = callNode("RecentSelect");
  if (!select) return;
  const records = [...allCallRecords].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 10);
  select.innerHTML = records.length
    ? records.map((record) => `<option value="${record.id}">${escapeHtml(callRecordLabel(record))}</option>`).join("")
    : `<option value="">暂无外呼记录</option>`;
}

function renderAdminCallRecords() {
  const body = document.querySelector("#callRecordsBody");
  if (!body) return;
  if (currentUser?.role !== "admin") {
    body.innerHTML = `<tr><td colspan="10">只有管理员可以查看全部外呼记录。</td></tr>`;
    return;
  }
  const records = filteredCallRecords();
  const summary = document.querySelector("#callBackendSummary");
  if (summary) summary.textContent = `当前筛选 ${records.length} 条；同一销售、同一学生只保留最新记录。`;
  body.innerHTML = records.length ? records.map((record) => {
    const state = record.call || {};
    const scores = state.scores || {};
    const level = callCustomerLevel(record);
    const report = record.analysis?.report || "暂无学情摘要";
    return `<tr>
      <td>${escapeHtml(formatTime(record.updatedAt || record.createdAt))}</td>
      <td><strong>${escapeHtml(record.owner?.username || "-")}</strong><br><span class="status-text">${escapeHtml(record.owner?.name || "")}</span></td>
      <td><strong>${escapeHtml(state.studentName || "-")}</strong><br><span class="status-text">${escapeHtml(state.gender || "性别未填")} · ${escapeHtml(state.school || state.pathway || "目标未填")} · 总分${escapeHtml(scores.total || "未填")}</span></td>
      <td>${escapeHtml([state.province, state.city, state.district].filter(Boolean).join(" ") || "-")}<br><span class="status-text">${escapeHtml(state.stage || "阶段未填")}</span></td>
      <td><strong>${escapeHtml(level.label)}</strong><br><span class="status-text">${escapeHtml(level.reason || "")}</span></td>
      <td>${escapeHtml(callTrackedSubjects(record).join("、") || "待判断")}</td>
      <td>${escapeHtml(state.concern?.join("、") || "-")}</td>
      <td>${escapeHtml(state.problems?.join("、") || "-")}</td>
      <td>${escapeHtml(state.next?.join("、") || "-")}</td>
      <td><details class="summary-details"><summary>查看摘要</summary><pre>${escapeHtml(report)}</pre></details></td>
    </tr>`;
  }).join("") : `<tr><td colspan="10">暂无符合筛选条件的外呼记录。</td></tr>`;
}

async function exportCallRecords() {
  if (!currentUser || currentUser.role !== "admin") {
    setBackendMessage("只有管理员可以导出外呼数据。");
    return;
  }
  const params = new URLSearchParams();
  const sales = document.querySelector("#callSalesFilter")?.value || "";
  const tier = document.querySelector("#callTierFilter")?.value || "";
  if (sales) params.set("sales", sales);
  if (tier) params.set("tier", tier);
  try {
    const response = await fetch(`/api/calls/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.ok) throw new Error("导出失败，请稍后再试");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.download = `外呼记录-${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    setBackendMessage(error.message);
  }
}

function loadCallRecord(record) {
  if (!record?.call) return;
  const state = record.call;
  const valueMap = {
    StudentName: state.studentName, Gender: state.gender, Province: state.province, District: state.district,
    Stage: state.stage, Decision: state.decision, Pathway: state.pathway, School: state.school,
    PolicyAwareness: state.policyAwareness, MajorAwareness: state.majorAwareness,
    ScoreTotal: state.scores?.total, ScoreChinese: state.scores?.chinese, ScoreMath: state.scores?.math,
    ScoreEnglish: state.scores?.english, ScorePhysics: state.scores?.physics, ScoreChemistry: state.scores?.chemistry,
    ScoreHistory: state.scores?.history, Rank: state.scores?.rank, ScoreNote: state.scoreNote, Quotes: state.quotes,
    Notes: state.notes, TeacherSubject: state.teacherSubject, TeacherTarget: state.teacherTarget, TeacherFocus: state.teacherFocus
  };
  Object.entries(valueMap).forEach(([suffix, value]) => { if (callNode(suffix)) callNode(suffix).value = value || ""; });
  populateCallCities(state.city);
  callNode("City").value = state.city || "";
  document.querySelectorAll("[data-call-group] .call-chip").forEach((chip) => {
    const group = chip.closest("[data-call-group]").dataset.callGroup;
    chip.classList.toggle("selected", (state[group] || []).includes(chip.textContent.trim()));
  });
  currentSourceCallId = record.id;
  latestCallContext = state;
  setCallMessage(`已调出${state.studentName || "学生"}的外呼记录。`);
  renderCallPanel();
}

function plannerNotesFromCall(state) {
  return [
    `外呼阶段：${state.stage || "未确认"}；升学路径：${state.pathway || "未确认"}。`,
    `家长关注：${state.concern.join("、") || "未记录"}；沟通对象：${state.decision || "未确认"}。`,
    `孩子状态：${state.problems.join("、") || "未记录"}；重点学科：${state.subjects.join("、") || "未记录"}。`,
    `补习经历：${state.tutoring.join("、") || "未确认"}；异议：${state.objections.join("、") || "未记录"}。`,
    state.scoreNote ? `成绩备注：${state.scoreNote}。` : "",
    state.quotes ? `家长原话：${state.quotes}。` : "",
    state.notes ? `销售备注：${state.notes}。` : ""
  ].filter(Boolean).join("\n");
}

function normalizeCallRegion(value, fallback = "") {
  const normalized = String(value || "")
    .replace(/壮族自治区$|回族自治区$|维吾尔自治区$|自治区$|省$|市$/u, "");
  return normalized === "市辖区" ? fallback : normalized;
}

function mapCallToPlanner(state) {
  const province = normalizeCallRegion(state.province);
  const city = normalizeCallRegion(state.city, province);
  form.elements.province.value = province;
  updateCityOptions(city);
  form.elements.city.value = city;
  renderScoreFields({});
  form.elements.name.value = state.studentName;
  form.elements.school.value = state.school || "";
  form.elements.totalManual.value = state.scores.total || "";
  form.elements.direction.value = state.subjects.some((item) => /物化|理科|数理化/.test(item)) ? "science" : "unknown";
  form.elements.notes.value = plannerNotesFromCall(state);
  const subjectMap = { chinese: "chinese", math: "math", english: "english", physics: "physics", chemistry: "chemistry", history: "history" };
  Object.entries(subjectMap).forEach(([callKey, formKey]) => {
    const input = scoreFields.querySelector(`[name="${formKey}"]`);
    if (input && state.scores[callKey] !== "") input.value = state.scores[callKey];
  });
  const scienceInput = scoreFields.querySelector('[name="science"]');
  if (scienceInput && state.scores.physics !== "" && state.scores.chemistry !== "") {
    const combined = Number(state.scores.physics) + Number(state.scores.chemistry);
    const max = Number(scienceInput.dataset.max || scienceInput.max || combined);
    scienceInput.value = Math.min(combined, max);
  }
  latestCallContext = state;
  render();
}

async function saveReplicatedCallRecord(state, analysis) {
  if (!currentUser) throw new Error("请先登录销售账号");
  const payload = await apiFetch("/api/calls", {
    method: "POST",
    body: JSON.stringify({ status: "未跟进", call: state, analysis })
  });
  if (!payload.record) throw new Error("外呼记录保存失败");
  allCallRecords = [payload.record, ...allCallRecords.filter((record) => record.id !== payload.record.id)];
  currentSourceCallId = payload.record.id;
  latestCallContext = state;
  renderAdminCallRecords();
  return payload.record;
}

async function generatePlanFromReplicatedCall(state, analysis) {
  const record = await saveReplicatedCallRecord(state, analysis);
  mapCallToPlanner(state);
  const saved = await saveRecord();
  if (!saved) throw new Error("规划记录保存失败");
  showView("plan");
  setBackendMessage(`已根据${state.studentName}的外呼记录生成学情规划和销售建议。`);
  return record;
}

async function generatePlanFromCall() {
  try {
    const record = await saveCallRecord({ silent: true });
    const state = record.call;
    mapCallToPlanner(state);
    currentSourceCallId = record.id;
    const saved = await saveRecord();
    if (!saved) throw new Error("规划记录保存失败");
    showView("plan");
    setBackendMessage(`已根据${state.studentName}的外呼记录生成学情规划和销售建议。`);
  } catch (error) {
    setCallMessage(error.message);
  }
}

function renderSalesUserSummary(data, analysis, callContext) {
  const grid = document.querySelector("#salesUserSummaryGrid");
  if (!grid) return;
  const state = callContext || {};
  const score = state.scores ? callScoreSummary(state) : `${analysis?.total || data.totalManual || "-"} / ${analysis?.totalMax || "-"}`;
  const location = [data.province, data.city].filter(Boolean).join(" ");
  const concern = state.concern?.join("、") || "未从外呼记录补充";
  const problems = state.problems?.join("、") || extractNotesInsight(data.notes || "").tags.join("、") || "待进一步诊断";
  const quote = state.quotes || "暂无家长原话记录";
  grid.innerHTML = `
    <div><strong>学生与升学</strong><p>${escapeHtml(data.name || "未命名学生")} · ${escapeHtml(location)}<br>${escapeHtml(state.stage || "阶段未确认")} · ${escapeHtml(data.school || state.pathway || "目标未确认")}</p></div>
    <div><strong>成绩与学科</strong><p>${escapeHtml(score)}<br>重点问题：${escapeHtml(problems)}</p></div>
    <div><strong>家长与决策</strong><p>${escapeHtml(state.decision || "沟通对象未确认")} · ${escapeHtml(concern)}<br>原话：${escapeHtml(quote)}</p></div>`;
}

function setupCallPanel() {
  const frame = document.querySelector("#callFrame");
  if (frame) {
    document.querySelector("#callSalesFilter")?.addEventListener("change", renderAdminCallRecords);
    document.querySelector("#callTierFilter")?.addEventListener("change", renderAdminCallRecords);
    document.querySelector("#exportCallRecordsBtn")?.addEventListener("click", exportCallRecords);
    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;
      const type = event.data?.type;
      if (!["gaokao-planner:save-call-summary", "gaokao-planner:generate-from-call"].includes(type)) return;
      try {
        if (type === "gaokao-planner:save-call-summary") {
          const record = await saveReplicatedCallRecord(event.data.payload, event.data.analysis || {});
          setBackendMessage(`已更新${record.call?.studentName || "学生"}的外呼摘要记录。`);
        } else {
          await generatePlanFromReplicatedCall(event.data.payload, event.data.analysis || {});
        }
      } catch (error) {
        setBackendMessage(error.message);
      }
    });
    return;
  }
  if (!callNode("Province")) return;
  callNode("Province").innerHTML = `<option value="">请选择省份</option>${Object.keys(cityOptions).map((province) => `<option value="${province}">${province}</option>`).join("")}`;
  callNode("Province").addEventListener("change", () => { populateCallCities(); renderCallPanel(); });
  callFieldIds.forEach((suffix) => {
    const node = callNode(suffix);
    if (!node || suffix === "Province") return;
    node.addEventListener("input", renderCallPanel);
    node.addEventListener("change", renderCallPanel);
  });
  document.querySelectorAll("[data-call-group] .call-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const group = chip.closest("[data-call-group]");
      if (chip.dataset.callExclusive) {
        group.querySelectorAll(`[data-call-exclusive="${chip.dataset.callExclusive}"]`).forEach((node) => {
          if (node !== chip) node.classList.remove("selected");
        });
      }
      chip.classList.toggle("selected");
      renderCallPanel();
    });
  });
  callNode("CopySummaryBtn").addEventListener("click", () => copyCallText(buildCallReport(getCallState()), "已复制学情摘要。"));
  callNode("CopyWechatBtn").addEventListener("click", () => copyCallText(buildCallWechat(getCallState()), "已复制微信跟进内容。"));
  callNode("SaveBtn").addEventListener("click", async () => { try { await saveCallRecord(); } catch (error) { setCallMessage(error.message); } });
  callNode("ResetBtn").addEventListener("click", resetCallPanel);
  callNode("GeneratePlanBtn").addEventListener("click", generatePlanFromCall);
  callNode("LoadRecentBtn").addEventListener("click", () => loadCallRecord(allCallRecords.find((record) => record.id === callNode("RecentSelect").value)));
  callNode("RecentSelect").addEventListener("change", () => loadCallRecord(allCallRecords.find((record) => record.id === callNode("RecentSelect").value)));
  populateCallCities();
  renderCallPanel();
}
