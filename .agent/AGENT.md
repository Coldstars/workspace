# AGENT.md

## 定位
本文件是 `.agent/` 目录的入口索引。
所有规则真源在根目录 `AGENTS.md` 和本目录下的 `references/`，本文件不重复其内容。

## 必读指针

### 规则真源
- 完整规则与行为约束 → `../AGENTS.md`
- 阶段门禁、项目锁、端类型、文档新鲜度、术语字典 → `./references/workflow/阶段门禁与文档新鲜度规则.md`
- 多页面结构边界 → `./references/workflow/多页面项目规格组织规则.md`
- 移动端规范读取地图 → `./references/mobile-ui/README.md`
- 后台管理端规范读取地图 → `./references/admin-ui/README.md`

### 端类型读取规则
- `PROJECT.md` 标记为 `mobile`：读取 `mobile-ui/README.md`，按移动端规则执行。
- `PROJECT.md` 标记为 `admin`：读取 `admin-ui/README.md`，按后台管理端规则执行。
- `PROJECT.md` 标记为 `mixed`：同时读取两个 README；每个页面按 `02-页面规格文件.md` 的“所属端”选择规则集。
- `PROJECT.md` 未明确端类型：禁止进入 02/03/04/05，先补 PROJECT 或 01。

### 阶段 Skill（按 01→05 顺序执行）
- `./skills/01-需求分析/SKILL.md`
- `./skills/02-页面规格文件/SKILL.md`
- `./skills/03-视觉规范/SKILL.md`
- `./skills/04-开发标准和验收标准/SKILL.md`
- `./skills/05-高保真原型实现/SKILL.md`

### 使用方式
- 每阶段：先读 `SKILL.md`，再按其 `template.md` 输出。
- 项目文档只写生效规则，不复制 reference 原文。
- 后台项目不得使用移动端规范替代后台信息架构、表格、批量操作和验收规则。
