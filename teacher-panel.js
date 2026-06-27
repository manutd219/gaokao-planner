(() => {
  const STORAGE_KEY = "lingshi_teacher_call_panel_v1";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const SUBJECT_KNOWLEDGE = {
    数学: {
      transition: "新高一数学从初中“题型模仿”转向“抽象表达 + 综合迁移”，重点看计算稳定性、函数方程意识和步骤表达。",
      warMap: "基础选择/填空先稳满分，函数与导数、圆锥曲线、数列、立体几何是后续冲高分的核心模块。",
      tags: {
        "基础体系 A": ["计算稳定性弱", "函数/方程衔接弱", "几何到代数转化弱", "公式概念记忆散", "基础题失分多"],
        "题型方法 A": ["综合题拆题弱", "题型识别慢", "数形结合弱", "分类讨论弱", "步骤表达不规范"],
        "应用发挥 P": ["会听不会做", "审题跳步", "限时做不完", "难题没有入口", "考试波动大"],
        "习惯动力 M": ["错题复盘不足", "畏难回避压轴题", "只完成作业不总结", "需要督促"]
      },
      reasons: [
        "基础漏洞多时，优先判断是不是初中代数、函数、几何语言没有形成体系。",
        "综合题做不出，多数不是单点知识不会，而是缺少题型识别和答题方法总结。",
        "上课听懂但做不出，要查从“看懂解析”到“独立拆题”的距离。"
      ],
      actions: ["提交 2 道最近数学错题并写出卡住位置", "做一次 20 分钟函数/方程限时小测", "整理一页错因分类：知识不会/方法不会/审题失误"]
    },
    物理: {
      transition: "新高一物理从记公式转向建模型，重点看概念能否转成过程图、受力/运动分析和公式适用条件。",
      warMap: "基础选择和基础实验必须先稳；中高分段看中档选择、力学实验、基础大题和压轴选择。",
      tags: {
        "基础体系 A": ["概念理解停留记忆", "单位/公式条件不清", "基础选择失分", "数学工具不稳"],
        "题型方法 A": ["过程分析弱", "受力/运动模型弱", "不会画图分析", "实验题步骤不清"],
        "应用发挥 P": ["公式套用明显", "题目一变就不会", "计算题失分", "限时大题写不完"],
        "习惯动力 M": ["害怕物理", "只背结论不复盘", "课堂跟得上作业卡住", "遇到综合题直接放弃"]
      },
      reasons: [
        "过程分析弱时，先查孩子能不能把文字题转成图、量、关系。",
        "公式套用明显时，要追问公式从哪里来、适用条件是什么。",
        "实验题失分时，不只看记忆，要看变量控制、数据处理和结论表达。"
      ],
      actions: ["让孩子口述一道物理题的过程图和已知量", "完成一次受力/运动模型小测", "提交一题实验题并标注变量、现象、结论"]
    },
    英语: {
      transition: "新高一英语从词句积累转向篇章理解，重点看词汇、长难句、阅读速度、语法体系和写作表达。",
      warMap: "听力和基础阅读先保分；中高分段看 BC/D 篇阅读、七选五、完形、语法填空和写作。",
      tags: {
        "基础体系 A": ["词汇量不足", "语法体系散", "长难句弱", "基础阅读定位慢"],
        "题型方法 A": ["阅读主旨弱", "推理判断弱", "七选五逻辑弱", "完形语境弱", "写作句式单一"],
        "应用发挥 P": ["阅读速度慢", "考试做不完", "听懂但选不对", "作文有想法写不出"],
        "习惯动力 M": ["不愿背单词", "单词本机械完成", "缺少每日阅读", "英语畏难"]
      },
      reasons: [
        "词汇断层会直接影响阅读速度和长难句理解，不能只靠刷题解决。",
        "阅读错得多要拆：定位信息、推理判断、主旨结构还是词义猜测。",
        "作文低分要查评分标准、句式储备和语法准确性。"
      ],
      actions: ["做一篇限时阅读并记录卡住句子", "整理 20 个高频生词和 3 个长难句", "提交一篇作文，标出语法错误和可替换句式"]
    },
    化学: {
      transition: "新高一化学从记忆现象转向概念网络和符号表达，重点看物质分类、方程式、实验现象转化和计算入口。",
      warMap: "基础选择先稳；结构题、原理综合题、有机化学和实验题决定中高分段。",
      tags: {
        "基础体系 A": ["符号语言不熟", "物质分类弱", "方程式基础弱", "基础选择失分", "概念网络散"],
        "题型方法 A": ["实验现象不会转化", "原理综合题无入口", "结构题表达弱", "计算入口弱"],
        "应用发挥 P": ["会背不会用", "题目情境一变就错", "计算步骤混乱", "综合题做不完"],
        "习惯动力 M": ["觉得化学靠背", "笔记体系混乱", "错题不归类", "畏难综合题"]
      },
      reasons: [
        "化学基础弱通常不是单个知识点，而是符号、分类、方程式之间没有连成体系。",
        "实验题失分要看现象、原理、变量和语言表达能不能互相转化。",
        "原理综合题不会做，要判断是概念缺口、计算入口还是题型方法缺失。"
      ],
      actions: ["整理 10 个易错方程式和对应现象", "提交一题实验题并写清现象到结论", "做一次物质分类/离子反应小测"]
    }
  };

  const TAG_GUIDANCE = {
    "计算稳定性弱": ["基础运算和代数变形不稳会拖累函数、数列和解析几何。", "做 15 分钟基础运算小测，要求写出每一步变形依据。"],
    "函数/方程衔接弱": ["初高衔接里函数语言会明显抽象化，要看定义域、对应关系、图像和方程思想是否能互相转化。", "用 3 道函数入门题检查定义域、单调性和方程转化。"],
    "综合题拆题弱": ["综合题困难通常来自题型识别和条件拆解，不是简单多刷题。", "让孩子复述题目条件、目标和第一步入口，判断是否具备拆题路径。"],
    "审题跳步": ["审题跳步要区分是读题习惯问题，还是基础概念不稳导致抓不住条件。", "提交一道错题，标出漏看的关键词和错误发生步骤。"],
    "过程分析弱": ["物理过程分析弱时，孩子往往不能把文字题转成图、量、关系。", "让孩子口述一道题的过程图、已知量、未知量和运动阶段。"],
    "受力/运动模型弱": ["新高一物理的核心不是记公式，而是建立受力和运动模型。", "完成一次受力图/运动过程图小测，先不追求难题。"],
    "公式套用明显": ["公式套用说明孩子可能不知道公式来源和适用条件。", "追问公式从哪里来、适用条件是什么、为什么这题能用。"],
    "实验题步骤不清": ["实验题失分要看变量控制、数据处理和结论表达，不只是记忆。", "提交一题实验题，标出变量、现象、数据处理和结论。"],
    "词汇量不足": ["词汇不足会同时影响阅读速度、长难句理解和完形判断。", "整理 20 个高频生词，要求放回原句复述含义。"],
    "长难句弱": ["长难句弱时，阅读不是读不懂单词，而是抓不住句子主干和修饰关系。", "挑 3 个长难句，让孩子划主谓宾和从句结构。"],
    "阅读速度慢": ["阅读速度慢要区分词汇卡顿、定位方法弱、还是逐字翻译习惯。", "做一篇限时阅读，记录每题定位句和耗时。"],
    "语法体系散": ["语法散会影响语填、改错和写作准确性。", "用时态、从句、非谓语各 1 题做快速诊断。"],
    "符号语言不熟": ["化学符号语言不熟，会导致方程式、离子反应和实验表达连锁失分。", "整理 10 个常见符号/方程式，要求说出含义和适用情境。"],
    "物质分类弱": ["物质分类弱会影响元素化合物、离子反应和氧化还原的后续学习。", "用物质分类表检查酸碱盐、氧化物和常见反应关系。"],
    "方程式基础弱": ["方程式不是背答案，要理解反应物、生成物、条件和守恒。", "提交 5 个易错方程式，逐个说明配平和反应现象。"],
    "实验现象不会转化": ["实验现象不会转化，说明现象、原理、结论之间没有连起来。", "用一道实验题训练：现象 → 原因 → 结论 → 表达。"],
    "会听不会做": ["会听不会做是应用能力问题，要看题型识别、步骤模板和独立复现。", "选一题课上听懂的题，隔天独立重做并记录卡点。"],
    "限时做不完": ["做不完可能来自基础不熟、入口慢或步骤冗余。", "做一次 20 分钟限时小测，记录每道题停留时间。"],
    "错题复盘不足": ["错题只抄答案没有用，必须分类到知识、方法、审题、表达或时间。", "建立一页错因分类表，并安排 3 天后重做。"]
  };

  const demoSummary = `【外呼学情摘要｜给主讲/管理者】

一、基础信息
- 学生姓名：陈同学；性别：未知
- 地区：广东 深圳
- 高考口径：3+1+2 新高考地区
- 孩子阶段：初升高
- 升学路径：重点/优质高中；目标学校/班型：暂未填写
- 沟通对象/决策链：妈妈

二、分数与学科记录
- 中考估算总分：573/630
- 数学约 100 分，英语成绩波动，物理成绩待核实
- 重点学科：数学、英语、物理
- 分数备注：目前只有总分口径，各科满分和最近三次成绩需要主讲核实

三、学生状态与既往学习
- 孩子问题：数学偶有审题跳步；英语阅读词汇不足；高中物理承接能力待观察
- 补习经历：线上大班
- 补习节奏：暑假预习

六、学科诊断口径
- 先判断孩子属于“基础缺”“会听不会做”还是“考试发挥不稳定”。
- 主讲要留下一个可验证抓手：一道题、一次限时训练或一个 7 天任务。

七、建议主讲沟通
- 建议主讲：数学/物理主讲
- 建议沟通对象：家长 + 孩子
- 主讲诊断重点：核实数学失分是审题、运算还是步骤问题；判断物理过程分析能力；确认英语词汇和阅读速度。

八、家长原话/关键信息
“孩子成绩还可以，但高中怕跟不上，尤其是不知道物理能不能学好。”

九、销售备注
家长愿意听专业建议，希望主讲不要重复介绍课程，先把孩子问题说清楚。

十、建议下一步
主讲沟通后，请留下一个具体题目反馈或 7 天小任务。`;

  function newStudent(name = "新学生") {
    return {
      id: `student_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      region: "",
      stage: "",
      target: "",
      scoreSummary: "",
      learningState: "",
      parentQuote: "",
      rawSalesSummary: "",
      diagnosisFocus: "",
      teacherAudience: "",
      teacherFocus: "",
      selectedSubject: "数学",
      subjectScores: {},
      mistakeScene: "",
      cooperation: "",
      focusChecks: [false, false, false, false],
      verified: [],
      tags: [],
      subjectTags: [],
      actions: [],
      callSignals: [],
      actionDate: "",
      followupDate: "",
      callNotes: "",
      teacherSummary: "",
      reportOverrides: {},
      updatedAt: new Date().toISOString()
    };
  }

  function initialState() {
    const demo = newStudent("陈同学");
    demo.region = "广东 深圳";
    demo.stage = "初升高";
    demo.target = "重点高中 · 211 / 双一流长期目标";
    demo.scoreSummary = "中考估算总分 573/630；数学约100分；英语成绩波动；物理成绩待核实。重点学科：数学、英语、物理。";
    demo.learningState = "线上大班经历；数学偶有审题跳步；英语阅读词汇不足；高中物理承接能力待观察。";
    demo.parentQuote = "家长原话：孩子成绩还可以，但高中怕跟不上，尤其是不知道物理能不能学好。\n销售备注：先诊断问题，不要重复介绍课程。";
    demo.rawSalesSummary = demoSummary;
    demo.diagnosisFocus = "核实数学失分是审题、运算还是步骤问题；判断物理过程分析能力；确认英语词汇和阅读速度。";
    demo.teacherAudience = "家长 + 孩子";
    demo.teacherFocus = "核实数学失分是审题、运算还是步骤问题；判断物理过程分析能力；确认英语词汇和阅读速度。";
    demo.selectedSubject = "数学";
    demo.subjectScores = { 数学: "约 100 分；满分待核实；最近三次成绩待补充", 物理: "成绩待核实；满分待核实", 英语: "成绩波动；满分待核实" };
    return { students: [demo], currentId: demo.id };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.students?.length) return saved;
    } catch {}
    return initialState();
  }

  let state = loadState();
  let saveTimer;

  function currentStudent() {
    return state.students.find((student) => student.id === state.currentId) || state.students[0];
  }

  function normalizeReportOverrides(student) {
    if (!student?.reportOverrides) return;
    if (student.reportOverrideMode !== "manual-field") {
      student.reportOverrides = {};
      return;
    }
    if (Object.keys(student.reportOverrides).length >= 8) student.reportOverrides = {};
  }

  function persist(message = "已自动保存") {
    const student = currentStudent();
    if (student) student.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const node = $("#saveState");
    node.textContent = message;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { node.textContent = "本地自动保存"; }, 1500);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function combinedText(student) {
    return [student.scoreSummary, student.learningState, student.diagnosisFocus, student.teacherFocus, student.rawSalesSummary].filter(Boolean).join("\n");
  }

  function inferPrimarySubject(student) {
    if (student.selectedSubject && SUBJECT_KNOWLEDGE[student.selectedSubject]) return student.selectedSubject;
    return inferSalesSubject(student);
  }

  function inferSalesSubject(student) {
    const text = combinedText(student);
    const subjects = [
      ["数学", ["数学", "函数", "方程", "几何", "运算", "计算", "审题", "步骤", "综合题"]],
      ["物理", ["物理", "受力", "运动", "过程分析", "实验", "公式", "模型"]],
      ["英语", ["英语", "词汇", "阅读", "语法", "长难句", "写作", "完形"]],
      ["化学", ["化学", "方程式", "物质", "实验现象", "符号语言"]]
    ];
    const scored = subjects.map(([subject, keys]) => [subject, keys.reduce((sum, key) => sum + (text.includes(key) ? 1 : 0), 0)]);
    scored.sort((a, b) => b[1] - a[1]);
    return scored[0][1] > 0 ? scored[0][0] : "待识别";
  }

  function selectedLabelsForSubject(student, subject) {
    return (student.subjectTags || [])
      .filter((item) => item.startsWith(`${subject}：`))
      .map((item) => item.split("：").slice(1).join("："));
  }

  function inferredLabelsFromText(student, subject) {
    const text = combinedText(student);
    const rules = {
      数学: [
        ["计算稳定性弱", ["计算", "运算", "算错", "口算", "代数", "稳定性"]],
        ["函数/方程衔接弱", ["函数", "方程", "不等式", "图像", "定义域"]],
        ["综合题拆题弱", ["综合题", "拆题", "压轴", "大题", "没有入口"]],
        ["审题跳步", ["审题", "跳步", "粗心", "漏条件", "步骤"]],
        ["会听不会做", ["会听不会做", "听懂", "不会做", "独立做题"]]
      ],
      物理: [
        ["概念理解停留记忆", ["概念", "只背", "背结论", "记公式", "理解不了"]],
        ["过程分析弱", ["过程分析", "过程", "建模", "情境", "文字题"]],
        ["受力/运动模型弱", ["受力", "运动", "模型", "力学", "画图", "不会画图"]],
        ["公式套用明显", ["套公式", "公式", "公式条件", "适用条件"]],
        ["实验题步骤不清", ["实验", "步骤", "变量", "数据处理", "结论表达"]],
        ["害怕物理", ["物理怕", "害怕物理", "物理跟不上", "学不好物理"]]
      ],
      英语: [
        ["词汇量不足", ["英语断层", "词汇", "单词", "背单词", "基础断层"]],
        ["语法体系散", ["语法", "时态", "从句", "非谓语"]],
        ["长难句弱", ["长难句", "句子", "句式"]],
        ["基础阅读定位慢", ["阅读", "定位", "读不懂"]],
        ["阅读速度慢", ["阅读速度", "做不完", "耗时"]],
        ["英语畏难", ["没有目标", "动力", "畏难", "不愿学", "内向"]]
      ],
      化学: [
        ["符号语言不熟", ["符号", "化学语言", "化学符号", "离子", "化合价"]],
        ["物质分类弱", ["物质分类", "分类", "酸碱盐", "氧化物"]],
        ["方程式基础弱", ["方程式", "配平", "反应物", "生成物", "守恒"]],
        ["实验现象不会转化", ["实验现象", "现象", "实验", "变量", "结论"]],
        ["会背不会用", ["会背不会用", "背了不会做", "题目一变", "情境一变"]],
        ["觉得化学靠背", ["化学靠背", "只背", "死记硬背"]]
      ]
    };
    return (rules[subject] || [])
      .filter(([, keys]) => keys.some((key) => text.includes(key)))
      .map(([label]) => label);
  }

  function dynamicReasonActions(student, subject) {
    const knowledge = SUBJECT_KNOWLEDGE[subject] || SUBJECT_KNOWLEDGE.数学;
    const manualLabels = selectedLabelsForSubject(student, subject);
    const labels = manualLabels.length ? manualLabels : inferredLabelsFromText(student, subject);
    if (!labels.length) {
      return {
        reasons: knowledge.reasons,
        actions: knowledge.actions
      };
    }
    const reasons = [];
    const actions = [];
    labels.forEach((label) => {
      const guidance = TAG_GUIDANCE[label];
      if (guidance) {
        reasons.push(`${label}：${guidance[0]}`);
        actions.push(`${label}：${guidance[1]}`);
      } else {
        reasons.push(`${label}：需结合典型错题判断是基础体系、题型方法、应用发挥还是习惯动力问题。`);
        actions.push(`${label}：用一道典型题或一次限时任务验证，不直接下结论。`);
      }
    });
    return { reasons, actions };
  }

  function localExamAdvice(student, subject) {
    const region = student.region || "";
    if (/广东|深圳|广州|佛山|东莞/.test(region)) {
      const subjectLine = subject === "物理" || subject === "化学"
        ? "理工、医学、计算机等方向通常高度依赖物理/化学组合，主讲诊断时要判断孩子能否承接物化路径。"
        : subject === "英语"
          ? "广东高考英语含听说能力考查，初高衔接不能只看笔试分，还要关注听力输入、口语表达和阅读速度。"
          : "广东 3+1+2 模式下，数学是物理类/历史类都要拉开的核心学科，深圳学生还要关注高中校内排名和分班节奏。";
      return `本地考情：${region || "广东"}按 3+1+2 口径沟通，首选物理/历史影响方向，${subjectLine} 最新政策、批次线和选科要求需要以广东省教育考试院/当年高考数据库核验。`;
    }
    if (/浙江|上海|北京|天津|山东|海南/.test(region)) {
      return `本地考情：${region}为新高考地区，需先确认当地选科模式、等级赋分和目标专业选科要求。最新政策建议以省级考试院当年公告核验。`;
    }
    if (region) {
      return `本地考情：已识别地区为${region}，主讲先按新高一衔接诊断，涉及选科、批次线、位次和专业要求时需接入当地最新官方数据核验。`;
    }
    return "本地考情：地区未完整确认，暂不输出具体政策判断；先补省份/城市，再核验当地新高考模式、选科要求和学校分班节奏。";
  }

  function inferSubjectScoreHint(student, subject) {
    const text = student.scoreSummary || "";
    const patterns = [
      new RegExp(`${subject}[^；;，,。\\n]*?(\\d+(?:\\.\\d+)?)\\s*(?:分|/)?[^；;。\\n]*`),
      new RegExp(`${subject}[^；;。\\n]*?(待核实|波动|不清楚|未记录)`)
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[0]) return `${match[0].trim()}；满分待核实；最近三次成绩待补充`;
    }
    return `${subject}成绩待核实；满分待核实；最近三次成绩待补充`;
  }

  function inferWeakPoint(student) {
    const text = combinedText(student);
    const rules = [
      ["会听不会做", ["会听不会做", "独立做题困难", "听懂", "不会做"]],
      ["基础断层", ["基础缺", "基础漏洞", "断层", "词汇不足", "概念不清"]],
      ["题型迁移弱", ["综合题", "题型", "过程分析", "模型", "长难句"]],
      ["考试发挥不稳", ["波动", "粗心", "时间", "做不完", "紧张"]],
      ["学习习惯需强化", ["错题", "复盘", "督促", "目标", "习惯"]]
    ];
    const hit = rules.find(([, keys]) => keys.some((key) => text.includes(key)));
    return hit ? hit[0] : "待核实具体错题和最近成绩变化";
  }

  function inferLocalContext(student) {
    const region = student.region || "地区待补充";
    if (/广东|深圳|广州|佛山|东莞/.test(region)) return `${region}｜3+1+2，新高一重点看物理/历史分流与数理化承接。`;
    if (/浙江|上海|北京|天津|山东|海南/.test(region)) return `${region}｜新高考地区，需结合当地选科模式确认学科组合风险。`;
    if (/四川|河南|河北|湖北|湖南|江苏|福建|重庆|安徽|江西|广西|贵州|甘肃|吉林|黑龙江/.test(region)) return `${region}｜新高考衔接期，先核实本省选科口径和高中入学分层节奏。`;
    return `${region}｜需补充当地高考模式、学校分班和目标层次。`;
  }

  function diagnosisCards(student) {
    const subject = inferPrimarySubject(student);
    const weak = inferWeakPoint(student);
    const knowledge = SUBJECT_KNOWLEDGE[subject] || SUBJECT_KNOWLEDGE.数学;
    const dynamic = dynamicReasonActions(student, subject);
    return [
      ["优先诊断学科", `${subject}｜${knowledge.transition}`],
      ["聚焦问题假设", `${weak}。通话中要用典型错题、课堂反馈或限时训练验证，避免只听“粗心/不认真”的表述。`],
      ["本地考情提醒", localExamAdvice(student, subject)],
      ["本次验证动作", dynamic.actions.slice(0, 3).join("；")]
    ];
  }

  function renderDiagnostics(student) {
    const subject = inferPrimarySubject(student);
    const knowledge = SUBJECT_KNOWLEDGE[subject] || SUBJECT_KNOWLEDGE.数学;
    const dynamic = dynamicReasonActions(student, subject);
    if ($("#diagnosisSubject")) $("#diagnosisSubject").textContent = `跟进学科：${subject}`;
    $("#primarySubject").textContent = inferSalesSubject(student);
    $("#weakPoint").textContent = inferWeakPoint(student);
    $("#localContext").textContent = inferLocalContext(student);
    if ($("#diagnosticGrid")) {
      $("#diagnosticGrid").innerHTML = diagnosisCards(student).map(([title, detail], index) => `
        <article class="diagnostic-card">
          <small>0${index + 1}</small>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(detail)}</p>
        </article>
      `).join("");
    }
    $("#subjectLead").textContent = `${subject}诊断：按“基础体系 A / 题型方法 A / 应用发挥 P / 习惯动力 M”拆解，结合典型错题验证。`;
    $("#subjectDiagnosisPanel").innerHTML = `
      <div class="subject-diagnosis-header">
        <strong>${escapeHtml(subject)} · 初高衔接诊断</strong>
        <span>${escapeHtml(knowledge.transition)}</span>
      </div>
      <div class="subject-diagnosis-grid">
        ${Object.entries(knowledge.tags).map(([group, tags]) => `
          <section class="diagnosis-tag-group">
            <h3>${escapeHtml(group)}</h3>
            <div class="tag-cloud compact-tags" data-subject="${escapeHtml(subject)}" data-diagnosis-group="${escapeHtml(group)}">
              ${tags.map((tag) => `<button type="button">${escapeHtml(tag)}</button>`).join("")}
            </div>
          </section>
        `).join("")}
      </div>
      <div class="reason-action-grid">
        <section>
          <h3>底层原因参考</h3>
          <ul>${dynamic.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
        <section>
          <h3>建议验证抓手</h3>
          <ul>${dynamic.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>
      </div>
    `;
    applySubjectSelected(student);
    renderSubjectPicker(student);
  }

  function renderSubjectPicker(student) {
    $$("[data-subject-select]").forEach((button) => {
      button.classList.toggle("selected", button.dataset.subjectSelect === inferPrimarySubject(student));
    });
  }

  function applySelected(selector, selectedValues) {
    $$(selector).forEach((button) => button.classList.toggle("selected", selectedValues.includes(button.textContent.trim())));
  }

  function applySubjectSelected(student) {
    $$("[data-subject] button").forEach((button) => {
      const subject = button.closest("[data-subject]")?.dataset.subject || "";
      button.classList.toggle("selected", student.subjectTags.includes(`${subject}：${button.textContent.trim()}`));
    });
  }

  function syncVerifyFields(student) {
    const subject = inferPrimarySubject(student);
    student.subjectScores = student.subjectScores || {};
    if ($("#subjectScoreLabel")) $("#subjectScoreLabel").textContent = `${subject}成绩与满分`;
    if ($("#verifyStudentInfo")) $("#verifyStudentInfo").value = [student.name, student.region].filter(Boolean).join("｜");
    if ($("#verifySubjectScore")) $("#verifySubjectScore").value = student.subjectScores[subject] || inferSubjectScoreHint(student, subject);
    if ($("#verifyLearningState")) $("#verifyLearningState").value = student.learningState || "";
    if ($("#verifyMistakeScene")) $("#verifyMistakeScene").value = student.mistakeScene || "";
    if ($("#verifyCooperation")) $("#verifyCooperation").value = student.cooperation || "";
  }

  function syncProfileFields(student) {
    $("#profileName").textContent = student.name || "未命名学生";
    $("#studentName").value = student.name || "";
    $("#studentRegion").value = student.region || "";
    $("#studentTarget").value = student.target || "";
    $("#teacherAudience").value = student.teacherAudience || "";
    $("#teacherFocus").value = student.teacherFocus || student.diagnosisFocus || "";
    $("#scoreSummary").value = student.scoreSummary || "";
    $("#learningState").value = student.learningState || "";
  }

  function readVerifyFields(student) {
    const info = ($("#verifyStudentInfo")?.value || "").trim();
    if (info) {
      const parts = info.split(/[｜|]/).map((item) => item.trim()).filter(Boolean);
      if (parts[0]) student.name = parts[0];
      if (parts[1]) student.region = parts.slice(1).join(" ");
    }
    const subject = inferPrimarySubject(student);
    student.subjectScores = student.subjectScores || {};
    if ($("#verifySubjectScore")) student.subjectScores[subject] = $("#verifySubjectScore").value.trim();
    if ($("#verifyLearningState")) student.learningState = $("#verifyLearningState").value.trim();
    if ($("#verifyMistakeScene")) student.mistakeScene = $("#verifyMistakeScene").value.trim();
    if ($("#verifyCooperation")) student.cooperation = $("#verifyCooperation").value.trim();
  }

  function renderAssistant(student) {
    const advice = [];
    const subject = inferPrimarySubject(student);
    const dynamic = dynamicReasonActions(student, subject);
    const manualLabels = selectedLabelsForSubject(student, subject);
    const selected = manualLabels.length ? manualLabels : inferredLabelsFromText(student, subject);
    advice.push(["已选标签建议", dynamic.reasons[0] ? `${dynamic.reasons[0]} 建议：${dynamic.actions[0]}` : "先点选 1-3 个学科表现，系统会生成更具体的原因和抓手。"]);
    advice.push(["当地考情提醒", localExamAdvice(student, subject)]);
    advice.push(["通话验证重点", selected.length ? `围绕“${selected.slice(0, 3).join("、")}”要一题一证据，不要直接给结论。` : "先让孩子或家长描述一道最近错题，确认是知识、方法、应用还是习惯问题。"]);
    advice.push(["家长表达建议", student.teacherAudience?.includes("孩子") ? "可以让孩子直接说解题过程，主讲再指出卡点；家长在旁边听结论和动作。" : "若暂时只和家长沟通，建议把问题转成可观察任务，避免只听家长主观描述。"]);
    advice.push(["下一步闭环", student.actions.length ? `已选动作：${student.actions.join("、")}。要约定完成时间和反馈方式。` : "本次至少留下一个动作：补成绩、交错题、限时训练或体验课观察。"]);
    $("#adviceStack").innerHTML = advice.map(([title, text]) => `<div class="advice-item"><strong>${escapeHtml(title)}</strong>${escapeHtml(text)}</div>`).join("");
  }

  function assessIntent(student) {
    let score = 50;
    const reasons = [];
    const text = combinedText(student);
    const subject = inferPrimarySubject(student);
    const subjectScore = student.subjectScores?.[subject] || "";
    const callSignals = student.callSignals || [];
    const callText = `${student.callNotes || ""} ${student.cooperation || ""} ${callSignals.join(" ")}`;
    const verifiedCount = (student.verified || []).length;
    if (text.match(/数学|物理|英语|化学|薄弱|跟不上|断层|不会|失分|波动|审题|词汇|阅读|过程分析/)) {
      score += 15;
      reasons.push("有明确学科痛点");
    }
    if (student.scoreSummary || subjectScore.match(/\\d/)) {
      score += 10;
      reasons.push("有成绩或满分线索");
    }
    if (student.mistakeScene) {
      score += 10;
      reasons.push("有具体错题/失分场景");
    }
    if (student.cooperation && !/不配合|拒绝|不愿|没时间/.test(student.cooperation)) {
      score += 10;
      reasons.push("孩子配合度可观察");
    }
    if (student.actions.length) {
      score += 10;
      reasons.push("已有后续学习动作");
    }
    if (student.teacherAudience) {
      score += 5;
      reasons.push("沟通对象明确");
    }
    if (verifiedCount >= 3) {
      score += 6;
      reasons.push("主讲已核准关键信息");
    }
    if (student.actionDate || student.followupDate || callSignals.includes("已约下次沟通")) {
      score += 8;
      reasons.push("后续时间已明确");
    }
    const positiveSignals = [
      ["家长认可诊断", 12, "家长认可主讲判断"],
      ["孩子愿意配合", 12, "孩子愿意参与验证"],
      ["愿意交错题", 8, "愿意提供题目证据"],
      ["愿意体验课", 8, "愿意进入体验验证"]
    ];
    positiveSignals.forEach(([label, delta, reason]) => {
      if (callSignals.includes(label)) {
        score += delta;
        reasons.push(reason);
      }
    });
    if (/认可|有道理|愿意|可以|配合|交错题|发题|体验|约/.test(callText)) {
      score += 6;
      reasons.push("通话反馈偏正向");
    }
    if (!student.scoreSummary && !subjectScore) {
      score -= 10;
      reasons.push("成绩证据不足");
    }
    if (!student.mistakeScene && !selectedLabelsForSubject(student, subject).length) {
      score -= 10;
      reasons.push("缺少题目级证据");
    }
    if (/不配合|拒绝|不愿|没时间|先不/.test(student.cooperation + student.learningState)) {
      score -= 10;
      reasons.push("存在配合阻力");
    }
    const negativeSignals = [
      ["只问价格", -8, "关注点偏价格"],
      ["孩子不配合", -15, "孩子配合阻力明显"],
      ["家长没时间", -10, "家长跟进时间不足"],
      ["暂不考虑", -15, "当前推进意愿低"],
      ["不认可诊断", -12, "主讲诊断未被认可"]
    ];
    negativeSignals.forEach(([label, delta, reason]) => {
      if (callSignals.includes(label)) {
        score += delta;
        reasons.push(reason);
      }
    });
    if (/只问价格|太贵|不考虑|不需要|没时间|不认可|不用了|再说/.test(callText)) {
      score -= 8;
      reasons.push("通话反馈存在阻力");
    }
    score = Math.max(0, Math.min(100, score));
    const level = score >= 80 ? "高推荐" : score >= 60 ? "中推荐" : "低推荐";
    const action = score >= 80
      ? "建议主讲给明确诊断和验证任务，推动体验课/后续沟通。"
      : score >= 60
        ? "建议先补成绩、错题和配合度证据，再判断课程适配。"
        : "建议轻量跟进，不强推，先补关键事实。";
    return { score, level, action, reasons: reasons.slice(0, 4) };
  }

  function renderIntent(student) {
    if (!$("#intentCard")) return;
    const result = assessIntent(student);
    $("#intentScore").textContent = `${result.score}%`;
    $("#intentLevel").textContent = result.level;
    $("#intentAction").textContent = result.action;
    $("#intentMeter").style.width = `${result.score}%`;
    $("#intentReasons").innerHTML = result.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>信息不足，先补成绩和具体问题。</li>";
  }

  function pickShort(text, fallback = "待主讲进一步核实") {
    const cleaned = String(text || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return fallback;
    return cleaned.length > 72 ? `${cleaned.slice(0, 72)}…` : cleaned;
  }

  function pickReportText(text, fallback = "待主讲进一步核实", limit = 120) {
    const cleaned = String(text || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return fallback;
    return cleaned.length > limit ? `${cleaned.slice(0, limit)}…` : cleaned;
  }

  function softenParentText(text) {
    return String(text || "")
      .replace(/会听不会做/g, "听懂后独立完成不稳")
      .replace(/薄弱/g, "待加强")
      .replace(/弱/g, "需加强")
      .replace(/问题严重/g, "需要重点关注")
      .replace(/不会/g, "掌握不稳")
      .replace(/差/g, "有提升空间")
      .replace(/不配合/g, "配合度还需观察")
      .replace(/成交|意向度|高推荐|中推荐|低推荐/g, "后续沟通");
  }

  function parentList(items, limit = 5, textLimit = 130) {
    return items
      .slice(0, limit)
      .map((item) => `<li>${escapeHtml(softenParentText(pickReportText(item, "", textLimit)))}</li>`)
      .join("");
  }

  function enrichReportReasons(reasons, subject) {
    return reasons.map((item) => {
      const text = String(item || "");
      if (/计算|运算/.test(text)) return `${text} 家长可以观察孩子是否经常“思路对但算错”，这类情况进入高中后会影响函数、数列、解析几何等连续推导题。`;
      if (/函数|方程/.test(text)) return `${text} 新高一${subject}会更强调符号、图像和条件转化，建议重点看孩子能否说清题目条件与解题入口。`;
      if (/综合题|拆题|题型/.test(text)) return `${text} 这类卡点不是单纯刷题量问题，更需要训练“读题—拆条件—找入口—表达步骤”的完整过程。`;
      if (/审题|步骤/.test(text)) return `${text} 建议通过一道典型错题复盘，区分是看错条件、漏写步骤，还是中间推理没有依据。`;
      if (/词汇|阅读|长难句/.test(text)) return `${text} 初高中英语差异不只在单词量，还在句子结构、语篇理解和限时阅读稳定性。`;
      if (/物理|受力|过程/.test(text)) return `${text} 新高一物理更看重过程建模，建议让孩子把对象、受力、运动过程先画出来再计算。`;
      if (/化学|实验|方程式/.test(text)) return `${text} 新高一化学需要把符号、现象和原理对应起来，不能只靠背结论。`;
      return text;
    });
  }

  function enrichReportActions(actions, subject) {
    return actions.map((item) => {
      const text = String(item || "");
      if (/小测|限时/.test(text)) return `${text} 重点不看一次分数，而看孩子是否能稳定写出过程、控制时间并复盘错因。`;
      if (/错题/.test(text)) return `${text} 提交时建议标注“卡在哪一步”，主讲才能判断是知识点、方法还是表达习惯。`;
      if (/函数/.test(text)) return `${text} 做完后让孩子口述定义域、图像特征和方程转化关系。`;
      if (/复述|条件|入口/.test(text)) return `${text} 如果孩子能说清题目目标和第一步入口，说明后续可以进入综合题拆解训练。`;
      if (/阅读|长难句|单词/.test(text)) return `${text} 要记录耗时、错因和卡住句子，避免只背单词不验证阅读效果。`;
      if (/受力|运动|过程图/.test(text)) return `${text} 重点看孩子能否先建模再套公式，而不是直接代数计算。`;
      if (/实验|现象|结论/.test(text)) return `${text} 要写清变量、现象和结论之间的关系，避免只记实验答案。`;
      return text;
    });
  }

  function setReportField(student, field, value, mode = "text") {
    const node = $(`[data-report-field="${field}"]`);
    if (!node) return;
    const overrides = student.reportOverrides || {};
    if (Object.prototype.hasOwnProperty.call(overrides, field)) {
      if (mode === "html") node.innerHTML = overrides[field];
      else node.textContent = overrides[field];
      return;
    }
    if (mode === "html") node.innerHTML = value;
    else node.textContent = value;
  }

  function saveReportOverride(student, node) {
    student.reportOverrides = student.reportOverrides || {};
    student.reportOverrideMode = "manual-field";
    const field = node?.dataset?.reportField;
    if (!field) return;
    student.reportOverrides[field] = node.tagName === "UL" ? node.innerHTML : node.textContent.trim();
  }

  function resetReportOverrides(student) {
    if (!student) return;
    student.reportOverrides = {};
    student.reportOverrideMode = "";
  }

  function shortLocalReportAdvice(student, subject, knowledge) {
    const region = student.region || "本地";
    if (/广东|深圳/.test(region)) {
      return `${region}按 3+1+2 路径衔接，高一阶段要同时关注校内排名、首选方向和${subject}承接能力。${knowledge.transition}`;
    }
    return `${region}高一衔接建议先看校内排名变化和${subject}承接情况。${knowledge.transition}`;
  }

  function buildFollowupSuggestion(student, subject) {
    const parts = [];
    if (student.actions?.length) parts.push(`已约定：${student.actions.join("、")}`);
    if (student.actionDate) parts.push(`完成时间：${student.actionDate}`);
    if (student.followupDate) parts.push(`下次沟通：${student.followupDate}`);
    if (student.callSignals?.includes("已约下次沟通") && !student.followupDate) parts.push("已约下次沟通，具体时间待确认");
    if (parts.length) return `${parts.join("；")}。建议明确由学管做提醒，主讲根据典型错题或课堂反馈校准后续重点。`;
    return "";
  }

  function renderParentReport(student) {
    if (!$("#parentReportCard")) return;
    const subject = inferPrimarySubject(student);
    const knowledge = SUBJECT_KNOWLEDGE[subject] || SUBJECT_KNOWLEDGE.数学;
    const dynamic = dynamicReasonActions(student, subject);
    const subjectScore = student.subjectScores?.[subject] || inferSubjectScoreHint(student, subject);
    const manualLabels = selectedLabelsForSubject(student, subject);
    const selected = manualLabels.length ? manualLabels : inferredLabelsFromText(student, subject);
    const localContext = shortLocalReportAdvice(student, subject, knowledge);
    const coreIssue = selected.length
      ? selected.slice(0, 4).join("、")
      : `${subject}基础体系、题型方法、应用发挥待确认`;
    const mainJudgement = selected.length
      ? `${student.name || "孩子"}当前${subject}建议先按“${selected.slice(0, 3).join("、")}”做水平评估。${localContext} 先用典型错题或课堂反馈复核，再确定从基础回补、方法训练还是衔接预习开始。`
      : `${student.name || "孩子"}当前${subject}信息还需补充。建议先核准成绩口径、典型错题和课堂反馈，再判断是先补基础、练方法，还是进入新高一衔接。${localContext}`;

    setReportField(student, "eyebrow", "领世精品小班 · 主讲诊断反馈");
    setReportField(student, "title", `${student.name || "学生"}学科诊断反馈`);
    setReportField(student, "subtitle", `${student.region || "地区待补充"}｜面向新高一初高衔接的主讲诊断建议`);
    setReportField(student, "subjectBadge", subject);
    setReportField(student, "regionLabel", "所在地区");
    setReportField(student, "region", softenParentText(student.region || "地区待补充"));
    if ($("#reportSubject")) $("#reportSubject").textContent = subject;
    if ($("#reportScore")) $("#reportScore").textContent = softenParentText(pickReportText(subjectScore, `${subject}成绩待核实`, 58));
    setReportField(student, "judgementLabel", "学情水平评估");
    setReportField(student, "mainJudgement", softenParentText(pickReportText(mainJudgement, "", 230)));
    setReportField(student, "coreLabel", "01 具体学科问题");
    setReportField(student, "coreIssue", softenParentText(coreIssue));
    setReportField(student, "coreEvidence", softenParentText(pickReportText(
      selected.length
        ? `${student.teacherFocus || student.diagnosisFocus || "建议结合一张典型错题或一次课堂反馈确认真实卡点。"}`
        : (student.teacherFocus || student.diagnosisFocus || student.learningState),
      "建议用典型错题、最近成绩和课堂反馈验证。",
      120
    )));
    setReportField(student, "reasonsLabel", "02 关键问题拆解");
    setReportField(student, "reasons", parentList(enrichReportReasons(dynamic.reasons, subject), 5, 180), "html");
    setReportField(student, "actionsLabel", "03 暑假学习建议");
    setReportField(student, "actions", parentList(enrichReportActions(dynamic.actions, subject), 4, 180), "html");
    const followupText = buildFollowupSuggestion(student, subject);
    const hasFollowupOverride = Object.prototype.hasOwnProperty.call(student.reportOverrides || {}, "followup");
    const followupSection = $("#reportFollowup")?.closest(".report-section");
    if (followupSection) followupSection.classList.toggle("is-hidden", !followupText && !hasFollowupOverride);
    setReportField(student, "followupLabel", "04 后续跟进建议（选填）");
    setReportField(student, "followup", softenParentText(followupText));
    setReportField(student, "footerBrand", "领世精品小班");
    setReportField(student, "footerNote", "本反馈基于当前沟通信息生成，后续会结合题目诊断和课堂反馈继续校准。");
  }

  function renderCurrentStudent() {
    const student = currentStudent();
    if (!student) return;
    normalizeReportOverrides(student);
    $("#profileName").textContent = student.name || "未命名学生";
    $("#studentName").value = student.name || "";
    $("#studentRegion").value = student.region || "";
    $("#studentTarget").value = student.target || "";
    $("#teacherAudience").value = student.teacherAudience || "";
    $("#teacherFocus").value = student.teacherFocus || student.diagnosisFocus || "";
    renderSubjectPicker(student);
    $("#scoreSummary").value = student.scoreSummary || "";
    $("#learningState").value = student.learningState || "";
    if ($("#parentQuote")) $("#parentQuote").value = student.parentQuote || "";
    $("#rawSalesSummary").value = student.rawSalesSummary || "";
    $("#callNotes").value = student.callNotes || "";
    $("#teacherSummary").value = student.teacherSummary || "";
    $("#actionDate").value = student.actionDate || "";
    $("#followupDate").value = student.followupDate || "";
    syncVerifyFields(student);
    $$('[data-check]').forEach((input) => { input.checked = student.verified.includes(input.dataset.check); });
    applySelected('[data-tag-group="learning"] button', student.tags);
    applySelected('[data-tag-group="action"] button', student.actions);
    applySelected('[data-tag-group="callSignal"] button', student.callSignals || []);
    renderDiagnostics(student);
    renderAssistant(student);
    renderIntent(student);
    renderParentReport(student);
  }

  function readCurrentStudent(sourceId = "") {
    const student = currentStudent();
    if (!student) return;
    if (sourceId.startsWith("verify")) {
      readVerifyFields(student);
    } else {
      student.name = $("#studentName").value.trim() || "未命名学生";
      student.region = $("#studentRegion").value.trim();
      student.target = $("#studentTarget").value.trim();
      student.teacherAudience = $("#teacherAudience").value.trim();
      student.teacherFocus = $("#teacherFocus").value.trim();
      student.scoreSummary = $("#scoreSummary").value.trim();
      student.learningState = $("#learningState").value.trim();
    }
    if ($("#parentQuote")) student.parentQuote = $("#parentQuote").value.trim();
    student.rawSalesSummary = $("#rawSalesSummary").value.trim();
    student.callNotes = $("#callNotes").value.trim();
    student.teacherSummary = $("#teacherSummary").value.trim();
    student.actionDate = $("#actionDate").value;
    student.followupDate = $("#followupDate").value;
    student.verified = $$('[data-check]:checked').map((input) => input.dataset.check);
    student.tags = $$('[data-tag-group="learning"] button.selected').map((button) => button.textContent.trim());
    student.subjectTags = $$('[data-subject] button.selected').map((button) => `${button.closest("[data-subject]").dataset.subject}：${button.textContent.trim()}`);
    student.actions = $$('[data-tag-group="action"] button.selected').map((button) => button.textContent.trim());
    student.callSignals = $$('[data-tag-group="callSignal"] button.selected').map((button) => button.textContent.trim());
  }

  function extractLine(text, labels) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = text.match(new RegExp(`${escaped}[：:]\\s*([^；;\\n]+)`));
      if (match?.[1]) return match[1].trim();
    }
    return "";
  }

  function extractSection(text, start, end) {
    const startIndex = text.indexOf(start);
    if (startIndex < 0) return "";
    const contentStart = startIndex + start.length;
    const endIndex = end ? text.indexOf(end, contentStart) : -1;
    return text.slice(contentStart, endIndex >= 0 ? endIndex : undefined).trim();
  }

  function cleanSection(text) {
    return text.replace(/^[-\s]+/gm, "").replace(/\n{3,}/g, "\n\n").trim();
  }

  function parseSalesSummary(text) {
    const student = currentStudent();
    student.rawSalesSummary = text.trim();
    const name = extractLine(text, ["学生姓名", "姓名"]);
    const region = extractLine(text, ["地区", "省份 / 高考地区", "省份"]);
    const stage = extractLine(text, ["孩子阶段", "阶段"]);
    const target = extractLine(text, ["目标学校/班型", "目标学校", "高考目标层次"]);
    const score = cleanSection(extractSection(text, "二、分数与学科记录", "三、学生状态与既往学习"));
    const stateSection = cleanSection(extractSection(text, "三、学生状态与既往学习", "四、销售判断"));
    const diagnose = cleanSection(extractSection(text, "六、学科诊断口径", "七、建议主讲沟通"));
    const teacher = cleanSection(extractSection(text, "七、建议主讲沟通", "八、家长原话/关键信息"));
    const quote = cleanSection(extractSection(text, "八、家长原话/关键信息", "十、建议下一步"));
    const focus = extractLine(text, ["主讲诊断重点", "希望主讲重点诊断"]);
    const audience = extractLine(text, ["建议沟通对象", "主讲沟通对象", "沟通对象/决策链", "沟通对象"]);

    if (name) student.name = name.split("；")[0].trim();
    if (region) student.region = region;
    if (stage) student.stage = stage;
    if (target && !target.includes("未记录") && !target.includes("未填写")) student.target = target;
    if (score) student.scoreSummary = score;
    if (stateSection || diagnose) student.learningState = [stateSection, diagnose].filter(Boolean).join("\n\n");
    if (quote || teacher) student.parentQuote = [quote, teacher].filter(Boolean).join("\n\n");
    student.diagnosisFocus = focus || teacher || diagnose;
    student.teacherAudience = audience || student.teacherAudience;
    student.teacherFocus = focus || student.teacherFocus || student.diagnosisFocus;
    const inferred = inferPrimarySubject({ ...student, selectedSubject: "" });
    if (SUBJECT_KNOWLEDGE[inferred]) student.selectedSubject = inferred;
    resetReportOverrides(student);
    persist("销售摘要已导入");
    renderCurrentStudent();
    showToast("销售摘要已解析并填入");
  }

  function generateSummary() {
    readCurrentStudent();
    const student = currentStudent();
    const subject = inferPrimarySubject(student);
    const dynamic = dynamicReasonActions(student, subject);
    const intent = assessIntent(student);
    const selected = selectedLabelsForSubject(student, subject);
    const subjectScore = student.subjectScores?.[subject] || inferSubjectScoreHint(student, subject);
    const lines = [
      `【主讲外呼记录｜${student.name}】`,
      "",
      `一、结论`,
      `- 意向度：${intent.score}%（${intent.level}）`,
      `- 本次主讲学科：${subject}`,
      `- 初步卡点：${selected.length ? selected.join("、") : inferWeakPoint(student)}`,
      `- 沟通信号：${(student.callSignals || []).length ? student.callSignals.join("、") : "待标记"}`,
      `- 推荐动作：${intent.action}`,
      "",
      `二、关键依据`,
      `- 地区/对象：${student.region || "待补充"}；${student.teacherAudience || "沟通对象待补充"}`,
      `- ${subject}成绩：${subjectScore}`,
      `- 典型场景：${student.mistakeScene || "待补充"}`,
      `- 孩子配合度：${student.cooperation || "待补充"}`,
      "",
      `三、主讲诊断`,
      `- 诊断重点：${student.teacherFocus || student.diagnosisFocus || "待补充"}`,
      `- 底层原因：${dynamic.reasons.slice(0, 2).join("；") || "待点选学科表现后生成"}`,
      `- 验证抓手：${dynamic.actions.slice(0, 2).join("；") || "提交典型错题或完成一次限时任务"}`,
      "",
      `四、后续安排`,
      `- 约定动作：${student.actions.length ? student.actions.join("、") : "待约定"}`,
      `- 完成时间：${student.actionDate || "待定"}；下次沟通：${student.followupDate || "待定"}`,
      `- 通话笔记：${student.callNotes || "待记录"}`
    ];
    student.teacherSummary = lines.join("\n");
    $("#teacherSummary").value = student.teacherSummary;
    persist("记录已生成");
    showToast("主讲沟通记录已生成");
  }

  async function copyText(text, message) {
    if (!text.trim()) return showToast("暂无可复制内容");
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
    } catch {
      showToast("复制失败，请手动复制");
    }
  }

  function bindEvents() {
    $("#openImportBtn").addEventListener("click", () => {
      $("#importText").value = currentStudent().rawSalesSummary || "";
      $("#importDialog").showModal();
    });
    $("#parseImportBtn").addEventListener("click", (event) => {
      event.preventDefault();
      const text = $("#importText").value.trim();
      if (!text) return showToast("请先粘贴销售摘要");
      parseSalesSummary(text);
      $("#importDialog").close();
    });
    $("#loadDemoBtn").addEventListener("click", () => {
      $("#importText").value = demoSummary;
      parseSalesSummary(demoSummary);
    });
    $$(".phase-tab").forEach((button) => button.addEventListener("click", () => {
      $$(".phase-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      $$(".phase-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.phasePanel === button.dataset.phase));
    }));

    document.addEventListener("click", (event) => {
      const tag = event.target.closest(".tag-cloud button");
      if (tag) {
        tag.classList.toggle("selected");
        readCurrentStudent();
        resetReportOverrides(currentStudent());
        persist();
        renderDiagnostics(currentStudent());
        renderAssistant(currentStudent());
        renderIntent(currentStudent());
        renderParentReport(currentStudent());
      }
    });

    document.addEventListener("input", (event) => {
      const reportNode = event.target.closest("[data-report-field]");
      if (!reportNode) return;
      saveReportOverride(currentStudent(), reportNode);
      persist("诊断报告已更新");
    });

    document.addEventListener("blur", (event) => {
      const reportNode = event.target.closest("[data-report-field]");
      if (!reportNode) return;
      saveReportOverride(currentStudent(), reportNode);
      persist("诊断报告已更新");
    }, true);

    $$("[data-subject-select]").forEach((button) => button.addEventListener("click", () => {
      readCurrentStudent();
      currentStudent().selectedSubject = button.dataset.subjectSelect;
      resetReportOverrides(currentStudent());
      persist("主讲学科已切换");
      renderCurrentStudent();
    }));

    const fieldIds = [
      "studentName", "studentRegion", "studentTarget", "teacherAudience", "teacherFocus", "scoreSummary", "learningState",
      "verifyStudentInfo", "verifySubjectScore", "verifyLearningState", "verifyMistakeScene", "verifyCooperation",
      "rawSalesSummary", "callNotes", "teacherSummary", "actionDate", "followupDate"
    ];
    fieldIds.forEach((id) => $("#" + id)?.addEventListener("input", () => {
      readCurrentStudent(id);
      resetReportOverrides(currentStudent());
      persist();
      if (id === "studentName") {
        $("#profileName").textContent = currentStudent().name;
      }
      if (id.startsWith("verify")) {
        syncProfileFields(currentStudent());
      } else if (["studentName", "studentRegion", "studentTarget", "teacherAudience", "teacherFocus", "scoreSummary", "learningState"].includes(id)) {
        syncVerifyFields(currentStudent());
      }
      renderDiagnostics(currentStudent());
      renderAssistant(currentStudent());
      renderIntent(currentStudent());
      renderParentReport(currentStudent());
    }));
    $$('[data-check]').forEach((input) => input.addEventListener("change", () => {
      readCurrentStudent();
      persist();
      renderIntent(currentStudent());
    }));
    $$('[data-edit-target]').forEach((button) => button.addEventListener("click", () => $("#" + button.dataset.editTarget).focus()));

    $("#saveBtn").addEventListener("click", () => { readCurrentStudent(); persist("已保存"); showToast("记录已保存到本机"); });
    $("#generateSummaryBtn").addEventListener("click", generateSummary);
    $("#copySummaryBtn").addEventListener("click", () => copyText($("#teacherSummary").value, "主讲记录已复制"));
    $("#downloadReportBtn")?.addEventListener("click", downloadParentReport);
  }

  async function downloadParentReport() {
    readCurrentStudent();
    renderParentReport(currentStudent());
    if (!window.html2canvas) return showToast("图片下载组件未加载，请刷新页面");
    const card = $("#parentReportCard");
    const canvas = await window.html2canvas(card, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });
    const link = document.createElement("a");
    const student = currentStudent();
    const subject = inferPrimarySubject(student);
    link.download = `${student.name || "学生"}-${subject}诊断反馈.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("诊断图片已下载");
  }

  bindEvents();
  renderCurrentStudent();
})();
