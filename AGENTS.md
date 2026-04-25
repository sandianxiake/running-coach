## 项目概述
- **名称**：running-coach（跑步教练）
- **描述**：专业的跑步智能体，帮助用户制定训练计划、预测赛事成绩、提供AI教练指导
- **技术项目根目录**：`/workspace/projects`

## 技术栈
- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI 库**：Vant 4
- **图表**：ECharts 5
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **包管理器**：pnpm（平台约束）
- **运行时**：Node.js 24

## 目录结构
```
/workspace/projects/
├── index.html              # HTML 入口
├── package.json            # 依赖配置
├── vite.config.ts         # Vite 配置（含 px-to-vw 转换）
├── tsconfig.json           # TypeScript 配置
├── src/
│   ├── main.ts            # 应用入口
│   ├── App.vue            # 根组件
│   ├── api/               # API 调用
│   ├── data/              # 数据文件
│   ├── models/            # 数据模型
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   ├── utils/             # 工具函数
│   └── views/             # 页面组件
├── scripts/
│   ├── coze-preview-build.sh  # 预览构建脚本
│   ├── coze-preview-run.sh    # 预览运行脚本
│   ├── build.sh              # 部署构建脚本
│   └── run.sh                # 部署运行脚本
└── dist/                  # 构建产物目录
```

## 关键入口
- **开发入口**：`src/main.ts`
- **HTML 入口**：`index.html`
- **预览命令**：`pnpm run dev`（已包装为脚本）
- **构建命令**：`pnpm vite build`
- **预览端口**：5000
- **部署端口**：5000（固定）

## 运行与预览
- **依赖安装**：`pnpm install`
- **本地开发**：`bash scripts/coze-preview-build.sh && bash scripts/coze-preview-run.sh`
- **预览验证**：
  - `curl http://localhost:5000` → HTTP 200
  - `ss -lptn 'sport = :5000'` → 0.0.0.0:5000

## 预览链路处理
- **项目类型**：Web 预览型
- **preview_enable**：enabled
- **预览方案**：Vite dev server（保留 HMR 能力）
- **根 .coze 路径**：`/workspace/projects/.coze`
- **子项目 .coze**：与根 .coze 同一位置（path = "."）
- **[dev] 配置**：
  - build：`["bash", "scripts/coze-preview-build.sh"]`
  - run：`["bash", "scripts/coze-preview-run.sh"]`

## 部署配置
- **deploy.kind**：service
- **deploy.flavor**：web
- **deploy.build**：`["bash", "scripts/build.sh"]`
- **deploy.run**：`["bash", "scripts/run.sh"]`
- **构建产物**：dist 目录（静态资源）
- **服务方案**：npx serve 提供静态服务

## 用户偏好与长期约束
- **包管理器强制**：Node.js 项目必须使用 pnpm，禁止 npm/yarn
- **端口约束**：预览和部署均固定使用 5000 端口
- **包管理器切换**：原项目使用 yarn，已转换为 pnpm

## 常见问题和预防
1. **端口占用**：幂等脚本会自动清理 5000 端口残留进程
2. **锁文件**：构建脚本使用 `--prefer-frozen-lockfile` 保持依赖一致性
3. **px 转 vw**：Vite 配置中 postcss-px-to-viewport 已配置 375 视口宽度
