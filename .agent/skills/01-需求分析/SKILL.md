---
name: requirement-analysis
description: 产出结构化需求分析结果。Use when 只有功能点/角色/场景，需要先收敛端类型、目标、范围与主流程。
---

# 需求分析

## 阶段目标
输出可直接进入 02 的《需求分析结果》，并在本阶段锁定项目端类型。

## 输入与输出
输入：`PROJECT.md`、`feature-list.md`、已有 `01`（如存在）。
规则：`workflow/阶段门禁与文档新鲜度规则.md`；按端类型读取 `mobile-ui/README.md` 或 `admin-ui/README.md`。
输出：`projects/<project-name>/01-需求分析结果.md`（按 `template.md`）。

## 阶段动作
1. 确认项目锁与文档有效性。
2. 判断并锁定端类型：`mobile / admin / mixed`；端类型不明时先补 PROJECT 或在 01 明确建议。
3. 明确原型目标、演示对象、成功标准。
4. 收敛角色与范围（纳入/不纳入）。
5. 提炼主流程（起点-动作-结果-回流）。
6. 给出页面优先级（P0/P1/P2），并标注每页所属端。
7. 标注风险与下游影响。

## 阶段质量线
Must：满足 workflow；端类型清晰；范围边界清晰；形成可演示主流程。  
Should：优先级可直接用于 02；风险包含影响与处理建议。  
Style：短句、可检查。
