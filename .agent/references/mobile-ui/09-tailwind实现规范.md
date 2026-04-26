# Tailwind 实现规范

## 1. 定位
移动端高保真原型默认采用 Tailwind-first。Tailwind 负责页面容器、布局、间距、色彩、卡片、按钮、导航、状态和动效的主要样式；组件库只补足复杂交互行为。

默认技术栈、视口、触控和组件边界遵循 `00-移动端默认口径.md`。

## 2. 页面容器
- 页面根容器建议：`max-w-[430px] mx-auto min-h-screen bg-slate-50`
- 需要手机壳式演示时，可在外层增加桌面居中背景，但移动页面本体宽度遵循默认口径。
- 内容区默认：`px-4`，模块间使用 `space-y-4` 或 `gap-4`。
- 禁止横向滚动，所有长文本、标签和按钮必须能在窄屏内换行或截断。
- 页面主滚动容器和局部滚动组件必须隐藏滚动条视觉，但保留滚动能力。
- 建议在全局 CSS 中为主滚动容器设置 `scrollbar-width: none`、`-ms-overflow-style: none`、`::-webkit-scrollbar { display: none; }`。
- 建议提供 `.no-scrollbar` 工具类，用于横向标签列表、Tabs、筛选项等局部滚动区域。

## 3. 安全区
- 底部导航和底部固定操作栏的安全区遵循默认口径。
- 可使用 CSS 变量或 Tailwind arbitrary value：
  - `pb-[calc(16px+env(safe-area-inset-bottom))]`
  - `bottom-0`
  - `pt-3`
- 主内容底部必须预留空间，避免被固定操作栏遮挡。

## 4. 卡片与模块
- 常规卡片建议：`rounded-2xl bg-white border border-slate-100 shadow-sm`
- 强调卡片可以增加轻背景、左侧状态条、专业深主色背景或同色系渐变。
- 项目建议声明 `primary`、`primaryDeep`、`primarySurface` 等 token：`primary` 用于按钮/选中态等小面积关键动作，`primaryDeep` 可用于 Hero 或摘要卡整卡背景，`primarySurface` 用于浅底信息区。
- 大面积卡片不得直接使用原色感强的 `red-500/#FF0000`、`blue-500/#0000FF`、`green-500/#00FF00` 等颜色铺满整卡；应使用项目声明的专业品牌 token，例如 `primaryDeep` 或同色系渐变。
- 卡片内距优先：`p-4`、`p-5`
- 卡片间距优先：`space-y-3`、`space-y-4`
- 卡片内信息结构建议：标题行、核心字段、状态/标签、辅助说明、操作入口。

## 5. 按钮与触控
- 主按钮建议 `h-11` 或 `min-h-11`。
- 主按钮样式必须与项目主色绑定，具备 `active:scale-[0.98]` 或等价按压反馈。
- 次按钮使用描边、浅底或文字按钮，不抢主按钮视觉权重。
- 图标按钮必须保持不低于 `44x44` 的点击热区。

## 6. 导航
- 顶部导航优先自定义 Tailwind 结构，遵循顶部导航参考规范。
- 底部 Tab 优先自定义 Tailwind 结构，图标使用 `lucide-react`。
- 导航项需要明确 active 状态：图标、文字、颜色或背景至少两项变化。
- 固定导航必须使用背景、边框或阴影与内容区分层。

## 7. 文字层级
- 页面标题：`text-lg font-semibold`
- 模块标题：`text-base font-semibold`
- 正文：`text-sm font-medium` 或 `text-sm`
- 辅助信息：`text-xs text-slate-500`
- 数据强调：`text-2xl font-semibold` 或按视觉规范设定。
- 不要在同一项目内随意新增字号。

## 8. 状态与语义色
- 状态色通过项目设计系统统一，不在单个页面随机写色值。
- 推荐语义：
  - 成功：绿色系
  - 警告：琥珀/橙色系
  - 风险：红色系
  - 处理中：蓝色系
  - 中性：灰色系
- 状态表达必须同时使用颜色、图标或文案，不能只依赖颜色。

## 9. 动效与反馈
- 常规过渡：`transition-all duration-200 ease-out`
- 可交互卡片建议增加：`active:scale-[0.99]`
- 按钮建议增加：`active:scale-[0.98]`
- focus 状态需要可见，不要移除键盘可达性反馈。
- 加载、提交成功、错误反馈必须可演示。

## 10. 组件库使用边界
- Tailwind 是样式主导。
- `antd-mobile` 仅在复杂行为组件上使用，例如 `Picker`、`DatePicker`、`Popup`、`Dialog`、`Toast`、`ImageUploader`。
- 使用组件库时必须统一外层容器、间距、色彩和字体，避免明显默认组件库观感。
- 卡片、按钮、导航、列表、状态组件优先自定义 Tailwind 实现。

## 11. 禁止事项
- 高刺激、无业务语义、原色感强的大面积渐变或整卡纯色直铺。
- 随机毛玻璃和无来源阴影。
- 同质卡片堆叠，无视觉锚点。
- 只靠组件库默认样式撑页面。
- hover/press/focus/active 状态缺失。
- 使用桌面表格承载移动端列表。
