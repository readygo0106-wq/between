# BETWEEN V2 项目协作说明

## 产品是什么

BETWEEN 是一本会陪用户一起走的数字 Gap Year 手账，面向毕业、离职、转行、暂停工作或处在人生两个阶段之间的人。核心循环是：

发现 → 去做 → 留下 → 回头看 → 再决定

它不是职业测评、效率工具、Todo App、AI 聊天机器人、心理诊断或社交媒体。AI 退到后台，只在用户已有足够真实记录时帮助整理。

## 技术栈

- Node.js 24（仓库内便携运行时）
- npm
- Next.js 16 App Router
- React 19 + TypeScript strict
- Tailwind CSS 4
- Supabase Auth / PostgreSQL / Storage
- Lucide Icons、Framer Motion 和本地 UI 组件
- Git

## 主要路由

- /：Landing
- /today：今天
- /discover：去发现
- /discover/[id]：现实行动详情
- /list：我的清单
- /capture：留下照片或文字
- /journey：我的旅程、阶段回顾和未来明信片
- /profile：账户、隐私与设置

旧路由只用于重定向，不能重新成为一级导航。

## 数据原则

- 用户数据只能来自用户真实操作，不编造用户经历。
- 官方 Action 使用 source_type = curated。
- 外部内容必须保存 source_url、source_name 和 retrieved_at；无法核验就不显示。
- Capture、图片和 Journey 默认 private。
- 访客模式明确标注“仅保存在当前浏览器”。
- 登录用户的数据写入 Supabase；所有用户表必须启用 RLS，使用 auth.uid() = user_id 隔离。
- 照片进入私有 user-captures bucket，数据库只保存 path 与 metadata，不能把 Base64 写入数据库。
- 环境变量和 Secret 不进入 Git；OpenAI API 只能在服务端调用。

## 设计原则

- 80% 简约现代 UI，20% 旅行手账个性。
- 使用真实摄影、自然光、生活感和不完美的细节。
- 主色保持 warm ivory / deep charcoal，同一屏最多两个明显 accent。
- 不使用 AI 紫色渐变、霓虹蓝、玻璃拟态、发光卡片、假统计或企业 Dashboard。
- Scrapbook、Passport、Map、Postcard 是隐喻，不是堆满贴纸和胶带。
- Mobile 优先，重点检查 390 / 768 / 1024 / 1440px。

## 中文文案

写得像一个可靠的人在陪用户说话。避免“探索无限可能、解锁人生、赋能、AI 驱动、智能洞察、精准匹配、定义未来”等 AI 或营销腔。保存 Capture 后只说“留下来了”，不要立即分析。

## 交互与无障碍

- 所有看起来可点击的元素必须真实工作。
- 禁止空链接、空 onClick、TODO 按钮和假数字。
- 表单需要 label、中文校验、loading、success、error 和 empty state。
- 删除必须确认。
- 保持语义 HTML、键盘导航、焦点样式、alt、对比度和 reduced motion。

## 目录

    app/                         页面与路由
    components/                  布局、产品组件与 UI 原语
    data/actions.ts              官方精选 Action
    lib/data/                    数据仓库与 Supabase 同步
    lib/images/                  图片 provider abstraction
    lib/storage/                 访客模式存储
    lib/supabase/                Supabase 客户端
    public/images/between/       项目本地授权图片
    supabase/migrations/         数据库、RLS 与 Storage migration
    types/                       产品数据类型

## 常用命令

    .\install-dependencies.cmd
    .\start-dev.cmd
    .\build.cmd
    .\preview.cmd

也可以使用 npm run lint、npm run typecheck、npm run build。停止服务器：在运行窗口按 Ctrl+C。

## 完成前检查

- 运行 lint、typecheck、build。
- 走通 Landing → Today → Discover → Action → List → Capture → Journey。
- 检查收藏、开始、完成、创建、编辑、删除、图片预览、刷新持久化。
- 检查访客模式与未配置 Supabase 时的 graceful degradation。
- 配置 Supabase 后检查注册、登录、退出、跨设备数据、RLS 和私有 signed URL。
- 审计全部中文文案和所有可点击元素。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
