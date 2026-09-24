# BETWEEN V2

一本会陪用户一起走的中文数字 Gap Year 手账。

## 本地运行

项目包含 Windows 便携版 Node.js。首次运行：

    .\install-dependencies.cmd
    .\start-dev.cmd

打开 http://127.0.0.1:3000。停止开发服务器时，在终端按 Ctrl+C。

生产构建与预览：

    .\build.cmd
    .\preview.cmd

## 环境变量

复制 .env.example 为 .env.local，只在本机或 Vercel 后台填写：

    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
    OPENAI_API_KEY=
    UNSPLASH_ACCESS_KEY=
    UNSPLASH_SECRET_KEY=

当前 V2 不依赖 OpenAI 或 Unsplash 才能运行。不要把 .env.local、Supabase service role key、OpenAI key 或 Unsplash secret 提交到 Git。

## Supabase 设置

1. 创建 Supabase project。
2. 在 Supabase SQL Editor 运行 supabase/migrations/202609230001_between_v2.sql，或使用 Supabase CLI 执行 migration。
3. 从 Project Settings → API 复制 Project URL 和 publishable key 到 .env.local。
4. 重新启动开发服务器。
5. 在 /profile 测试注册、邮件确认、登录和退出。

Migration 会创建 profiles、actions、user_actions、captures、capture_images、journey_events、future_postcards、stamps、reflections、stories、favorites，以及私有 Storage bucket user-captures。

所有用户表都启用 RLS。私人图片只允许读取路径第一段与 auth.uid() 相同的对象。

## 数据模式

- 未配置 Supabase：进入访客模式，内容仅保存在当前浏览器。
- 已登录：Action、Capture、Postcard、Stamp 与 Reflection 同步至 Supabase。
- 用户图片上传到 private bucket；数据库只保存 storage path。
- 官方 Action 明确标记为 curated；没有伪造用户、活动或统计。

## 部署

项目使用 GitHub Actions 自动发布到 GitHub Pages：

1. 推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动检查并构建网站。
2. 构建成功后发布到 `https://readygo0106-wq.github.io/between/`。
3. 未配置 Supabase 时，线上网站自动使用访客模式，数据只保存在当前浏览器。
4. 需要启用登录与跨设备同步时，在 GitHub 仓库的 Actions variables 中配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。
5. 配置 Supabase 后，还需要把 GitHub Pages 地址加入 Supabase Auth 的 Site URL 与 Redirect URLs。

## 检查

    npm run lint
    npm run typecheck
    npm run build

不要提交 .next/、node_modules/、.tools/ 或任何 Secret。
