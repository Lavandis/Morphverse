# Morphverse V0 Architecture

Morphverse V0 采用单仓分层结构：

- `apps/web` 负责三栏交互、模块化 UI 和本地演示态数据
- `apps/api` 负责 REST 接口聚合，不承载核心业务规则
- `apps/jobs` 预留异步任务入口，用于语义推荐和复合态射计算
- `packages/domain` 定义态射、连接、推荐候选等核心领域模型
- `packages/application` 定义创建态射、连接、推荐与复合的用例编排
- `packages/data-access` 提供仓储接口和内存实现
- `packages/ai` 提供 mock AI provider，并为真实 LLM/RAG 预留端口

当前 V0 默认走 mock 流程，但 API 和应用层都已经围绕可替换依赖设计。
