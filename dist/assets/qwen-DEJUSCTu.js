const d=[{id:"1",category:"训练方法",title:"什么是轻松跑？",keywords:["轻松跑","慢跑","有氧","easy run"],content:"轻松跑是一种低强度的跑步训练，配速通常比你的比赛配速慢 1.5-2 分钟/公里。轻松跑的主要目的是增强心肺功能、恢复体力、打下有氧基础。"},{id:"2",category:"训练方法",title:"什么是间歇跑？",keywords:["间歇跑","速度训练","interval","间歇"],content:"间歇跑是一种高强度训练方法，通过快跑和慢跑交替进行。比如：快跑 800米 + 慢跑 400米，重复多组。间歇跑可以有效提升速度和耐力。"},{id:"3",category:"训练方法",title:"什么是 LSD（长距离慢跑）？",keywords:["LSD","长距离慢跑","长距离","long slow distance"],content:"LSD 是 Long Slow Distance 的缩写，即长距离慢跑。通常配速很慢，但距离很长（比如 15-30 公里）。LSD 是马拉松训练的核心，主要提升耐力和信心。"},{id:"4",category:"损伤预防",title:"如何预防跑步膝？",keywords:["跑步膝","膝盖痛","膝痛","损伤","预防"],content:"预防跑步膝的方法：1. 加强股四头肌和臀肌力量；2. 控制跑量，循序渐进；3. 选择合适的跑鞋；4. 注意跑姿；5. 跑后拉伸。"},{id:"5",category:"损伤预防",title:"跑步后如何拉伸？",keywords:["拉伸","跑后拉伸","恢复","放松"],content:"跑步后应该拉伸这些部位：1. 大腿前侧（股四头肌）；2. 大腿后侧（腘绳肌）；3. 小腿（腓肠肌）；4. 臀部；5. 腰部。每个动作保持 30-60 秒。"},{id:"6",category:"营养恢复",title:"跑步后应该吃什么？",keywords:["营养","饮食","跑步后吃什么","恢复","补充"],content:"跑步后 30-60 分钟是黄金补充期，建议：1. 碳水化合物（补充糖原）；2. 蛋白质（修复肌肉）；3. 水分和电解质。比如：香蕉 + 牛奶，或者面包 + 鸡蛋。"},{id:"7",category:"营养恢复",title:"马拉松比赛中如何补给？",keywords:["补给","比赛补给","马拉松补给","盐丸","能量胶"],content:"马拉松比赛补给建议：1. 每 5-7 公里喝一次水；2. 每 45-60 分钟吃一个能量胶；3. 适量补充盐丸（防止抽筋）；4. 平时训练多模拟比赛补给。"},{id:"8",category:"装备选择",title:"如何选择跑鞋？",keywords:["跑鞋","鞋子","选鞋","装备"],content:"选择跑鞋的要点：1. 知道自己的足型（正常/高足弓/扁平足）；2. 根据跑量选择缓震级别；3. 下午或晚上去试鞋（脚会肿胀）；4. 留一指空间；5. 跑鞋寿命一般 500-800 公里。"},{id:"9",category:"赛事知识",title:"半程马拉松是多少公里？",keywords:["半程马拉松","半马","距离","赛事"],content:"半程马拉松（Half Marathon）是 21.0975 公里。"},{id:"10",category:"赛事知识",title:"全程马拉松是多少公里？",keywords:["全程马拉松","全马","马拉松","距离","赛事"],content:"全程马拉松（Marathon）是 42.195 公里。"},{id:"11",category:"赛事知识",title:"马拉松赛前一周如何安排训练？",keywords:["赛前","赛前一周"," taper","减量","赛事"],content:"马拉松赛前一周应该逐渐减量（Taper）：1. 周一开始减少跑量 30-50%；2. 停止速度训练；3. 赛前 2-3 天可以来个短距离轻松跑；4. 赛前一天休息或散步。"},{id:"12",category:"常见问题",title:"刚开始跑步，跑量应该怎么加？",keywords:["新手","刚开始跑步","跑量","循序渐进","10%原则"],content:"新手增加跑量要遵循 10% 原则：每周跑量增加不超过上周的 10%。比如：上周跑了 10 公里，这周最多跑 11 公里。给身体足够的适应时间，避免受伤。"},{id:"13",category:"常见问题",title:"跑步时岔气怎么办？",keywords:["岔气","腹痛","肚子疼","侧腹痛"],content:"跑步时岔气的处理方法：1. 放慢速度，改成快走；2. 按住岔气的部位；3. 深呼吸，用鼻子吸气，嘴巴呼气；4. 如果还不缓解，就停下来休息。预防：饭后 1-2 小时再跑，跑前热身。"},{id:"14",category:"常见问题",title:"跑步可以减肥吗？",keywords:["减肥","瘦身","减脂","减重"],content:"跑步是很好的减肥运动，但需要配合饮食：1. 每周跑 3-5 次，每次 30-60 分钟；2. 控制热量摄入，制造热量缺口；3. 配合力量训练，增加肌肉量；4. 坚持，减肥是持久战！"}],y=(t,o=3)=>{const n=t.toLowerCase(),a=n.split(/\s+/);return d.map(e=>{let c=0;e.title.toLowerCase().includes(n)&&(c+=10);for(const r of e.keywords)n.includes(r.toLowerCase())&&(c+=5);e.content.toLowerCase().includes(n)&&(c+=2);for(const r of a)r.length>1&&(e.title.toLowerCase().includes(r)&&(c+=3),e.content.toLowerCase().includes(r)&&(c+=1));return{item:e,score:c}}).filter(e=>e.score>0).sort((e,c)=>c.score-e.score).slice(0,o).map(e=>e.item)},h=`
你是一位专业的跑步教练。基于以下用户信息和历史跑步数据，预测该用户完成半程马拉松和全程马拉松的预计用时。

用户信息：
- 昵称：{nickname}
- 年龄：{age}岁
- 性别：{gender}
- 身高：{height}cm
- 体重：{weight}kg

最近10次跑步数据：
{recentRuns}

请以JSON格式返回：
{
  "halfMarathon": {
    "time": "HH:MM:SS",
    "pace": "每公里配速",
    "confidence": "高/中/低"
  },
  "fullMarathon": {
    "time": "HH:MM:SS",
    "pace": "每公里配速",
    "confidence": "高/中/低"
  },
  "advice": "训练建议",
  "weakness": "需要提升的方面"
}
`,w=`
为用户制定一个{weeks}周的训练计划，目标是完成{targetRace}。

用户当前能力：
- 最近月跑量：{monthlyMileage}km
- 最长单次距离：{longestRun}km
- 平均配速：{avgPace}

请按周安排训练，每周包含：
- 2-3次轻松跑
- 1次速度训练
- 1次长距离慢跑
- 2天休息或交叉训练

返回JSON格式的训练计划。
`,p=`
你是一位专业、耐心、有亲和力的跑步教练，名叫"小跑"。

【角色设定】
- 专业：精通跑步训练、运动损伤预防、营养恢复
- 耐心：用通俗易懂的语言解释
- 鼓励：给予用户积极的反馈和建议

【回答规则】
1. 优先使用【相关知识库】中的信息回答
2. 如果知识库没有相关内容，用你自己的知识回答
3. 回答要简洁，不超过 300 字
4. 用教练的语气，友好、鼓励

【用户历史数据（如果有）】
{userContext}
`,l="sk-13e63726c1774d4897ed1c09a08e7041",g="https://dashscope.aliyuncs.com/compatible-mode/v1",u={async generateText(t,o){const n=[];o&&n.push({role:"system",content:o}),n.push({role:"user",content:t});try{const a=await fetch(`${g}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l}`},body:JSON.stringify({model:"qwen-plus",messages:n,temperature:.7})});if(!a.ok){const e=await a.json().catch(()=>({}));throw console.error("API请求失败:",a.status,e),new Error(`API请求失败: ${a.status} ${e.message||""}`)}return(await a.json()).choices[0].message.content}catch(a){throw console.error("generateText错误:",a),a}},async predictRace(t,o){const n=h.replace("{nickname}",t.nickname).replace("{age}",t.age.toString()).replace("{gender}",t.gender).replace("{height}",t.height.toString()).replace("{weight}",t.weight.toString()).replace("{recentRuns}",JSON.stringify(o.slice(0,10))),a=await this.generateText(n);return JSON.parse(a)},async generateTrainingPlan(t){const o=w.replace("{weeks}",t.totalWeeks.toString()).replace("{targetRace}",t.targetRace).replace("{monthlyMileage}",t.monthlyMileage.toString()).replace("{longestRun}",t.longestRun.toString()).replace("{avgPace}",t.avgPace),n=await this.generateText(o);return JSON.parse(n)},async chatWithCoach(t,o,n,a){const s=y(t,3);let e="";o&&(e+=`
用户信息：
- 昵称：${o.nickname}
- 年龄：${o.age}岁
- 性别：${o.gender}
- 身高：${o.height}cm
- 体重：${o.weight}kg
`),n&&n.length>0&&(e+=`
最近 5 次跑步记录：
${JSON.stringify(n.slice(0,5))}
`);const c=p.replace("{userContext}",e),r=[];return a&&r.push(...a.map(i=>({role:i.role,content:i.content}))),r.push({role:"user",content:t}),{content:(await(await fetch(`${g}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l}`},body:JSON.stringify({model:"qwen-plus",messages:[{role:"system",content:c},...r],temperature:.7})})).json()).choices[0].message.content,retrievedKnowledge:s}}};export{u as q};
