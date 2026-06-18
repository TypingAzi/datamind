# 软件设计文档 (SDD)：智能化数据服务轻量级代理系统 (BFF)

## 1. 全局目标 (Global Objectives)

本项目旨在搭建一个极轻量级的 Web 应用，作为智能化数据服务（如数据探查、业务图谱聚合等）的前端展示与网关层。
核心痛点与解决方案：

* **痛点**：底层核心业务由庞大且沉重的 Java 微服务集群提供，前端直接对接会导致接口过于细碎、跨域问题以及缺乏灵活的本地配置能力。
* **解决方案**：引入 Python (FastAPI) 作为 BFF（Backend For Frontend）层，负责接口聚合、跨域处理、请求转发以及基于 SQLite 的轻量级本地状态存储。前端采用极简的 React 架构实现快速的 UI 渲染与状态响应。

## 2. 技术栈与硬性约束 (Tech Stack & Constraints)

### 2.1 前端 (Frontend)

* **核心框架**: React 18 + Vite (禁用 Create React App)
* **状态管理**: Zustand (禁用 Redux)
* **数据请求**: Axios 或 SWR (用于处理请求状态和缓存)
* **UI 与样式**: Tailwind CSS + shadcn/ui (禁用 Ant Design 等重型组件库，要求按需引入无冗余)
* **约束**: 所有业务组件必须是函数式组件，严格使用 Hooks；页面需具备基础的加载状态（骨架屏/Loading）和错误容错 UI。

### 2.2 后端 BFF 层 (Backend)

* **核心框架**: Python 3.11 + FastAPI
* **异步 HTTP 客户端**: `httpx` (用于调用底层 Java 接口，禁用同步 `requests` 库)
* **ORM 与数据校验**: SQLModel (结合 Pydantic 与 SQLAlchemy 的特性)
* **约束**: 所有的外部 API 调用必须是异步的 (`async/await`)；必须利用 FastAPI 自动生成完整的 OpenAPI/Swagger 文档。

### 2.3 存储与部署 (Storage & Deployment)

* **数据库**: SQLite (仅用于存储系统本地配置、用户级轻量偏好或简单的日志打点，不存储核心业务数据)
* **容器化**: Docker Compose 一键编排 (Nginx Alpine 服务前端，Python Slim 服务后端，通过 Volume 持久化 SQLite 数据文件)

## 3. 数据模型 (Schema Definition)

以下为 BFF 层本地存储的核心数据模型定义，使用 SQLModel 规范：

```python
from typing import Optional
from sqlmodel import Field, SQLModel

class SystemConfig(SQLModel, table=True):
    """
    本地系统配置表：用于存储前端所需的动态配置或Java服务的环境变量覆盖
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    config_key: str = Field(index=True, unique=True, description="配置键名，如 'java_api_timeout'")
    config_value: str = Field(description="配置项的值")
    description: Optional[str] = Field(default=None, description="配置项的业务用途说明")
    is_active: bool = Field(default=True, description="是否生效")

```

## 4. API 契约 (API Contracts)

### 4.1 BFF 本地配置接口

**获取系统配置**

* **Path**: `GET /api/v1/config/{config_key}`
* **Response**: `200 OK`
```json
{
  "config_key": "java_api_timeout",
  "config_value": "5000",
  "is_active": true
}

```



### 4.2 BFF 代理聚合接口 (Proxy to Java)

**获取智能数据分析聚合视图**

* **Path**: `GET /api/v1/data-service/overview`
* **BFF 内部逻辑**:
1. 并行发起两个异步请求至底层 Java 服务：
* `GET {JAVA_HOST}/internal/api/metadata/status`
* `GET {JAVA_HOST}/internal/api/quality/report/latest`


2. 捕获并打平数据，组装为前端所需结构。


* **Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "metadata_count": 1250,
    "quality_score": 98.5,
    "last_probe_time": "2026-06-13T10:00:00Z",
    "alerts": []
  }
}

```



## 5. 业务规则与异常边界 (Business Rules & Error Handling)

1. **超时控制机制**：BFF 层使用 `httpx` 调用底层 Java 服务时，必须设置严格的超时时间（默认 5 秒，可从 SQLite 读取动态配置）。
2. **优雅降级与错误透传**：
* 若底层 Java 服务不可用或超时，BFF 层必须捕获异常，并返回标准化的 HTTP 502 (Bad Gateway) 状态码及明确的 JSON 错误信息。
* 错误响应格式统一为：`{"detail": "底层服务连接失败: [具体原因]", "code": "ERR_UPSTREAM_TIMEOUT"}`。


3. **前端异常处理**：前端全局 Axios 拦截器需统一拦截 502 错误，并通过轻量的 Toast 或 Alert 组件向终端用户展示“系统当前繁忙，请稍后重试”，严禁页面崩溃白屏。