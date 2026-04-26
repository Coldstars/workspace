---
name: visual-specification
description: 产出高保真视觉规范。Use when 02 已确认，需要按端类型稳定视觉表现并直接指导 04/05 落地。
---

# 视觉规范

## 阶段目标
在不改变 02 结构边界前提下，产出可执行、可评分、可复测的视觉规范，稳定指导高保真页面落地。

## 输入与输出
输入：`PROJECT.md`、`02-页面规格文件.md`、已有 `03`（如存在）。
规则：`workflow/阶段门禁与文档新鲜度规则.md`、`workflow/多页面项目规格组织规则.md`，按端类型读取 `mobile-ui/README.md` 或 `admin-ui/README.md`。
输出：`projects/<project-name>/03-视觉规范.md`（严格按 `template.md`）。

## 阶段动作
1. 复核 `02` 有效性并锁定结构边界，不得新增 `02` 未定义结构。
2. 确认端类型与视觉规则集：mobile 走 `mobile-ui/08`，admin 走 `admin-ui/08`，mixed 分端映射。
3. 输出 Design Archetype 与 Design Principles，明确项目气质、目标用户、核心目的和避免方向。
4. 输出 Color System 的可执行 token（主色、状态色、背景/前景/边框、导航策略）。
5. 输出 Typography、Layout Strategy、Visual Language 的量化规则（字号、字重、间距、圆角、阴影、动效、触控或鼠标键盘交互）。
6. 输出 Core Components 规则；后台项目必须覆盖布局壳、侧边栏、顶部栏、面包屑、卡片、表格、筛选、按钮、标签、弹窗、抽屉、状态页。
7. 按 `02` 逐页输出 Page-by-Page Visual Mapping，逐页写区域重点、首屏层级、操作与状态表现。
8. 输出 Quality Gate（评分、扣分项、Must 修复项、交付检查），并给出 03→04/05 的可消费检查点。
9. 完成阶段自校验：可执行性、结构边界一致性、下游可消费性。

## 最小可落地集合（Must）
- Design Archetype 与 Design Principles 已完成，且不只停留在审美词。
- Color System 已给出可执行 token（主色 + 至少 4 种状态色 + 背景/前景/边框）。
- mobile 项目 Core Components 至少覆盖：导航、卡片、列表、表单、按钮、图表、状态页。
- admin 项目 Core Components 至少覆盖：后台壳、侧边栏、顶部栏、面包屑、卡片、表格、筛选、表单、按钮、标签、弹窗/抽屉、状态页。
- Page-by-Page Visual Mapping 覆盖 `02` 页面清单，逐页可对照实现。
- Quality Gate 已包含评分口径、Must 修复项、交付检查。

## 阶段质量线
Must：
- 严格遵守 `02` 结构边界。
- `03` 文档章节结构与模板一致（Design Archetype → Quality Gate）。
- 每个章节包含可执行参数（token/数值/规则），不是审美词堆叠。
- 逐页映射完整，可直接被 `04/05` 消费。
- 端类型与 reference 映射明确。

Should：
- 主流程与高频页面优先细化。
- 风险与降级策略可追踪。

Style：
- 少形容词，多参数与检查项。
