import asyncio
import os
from contextlib import asynccontextmanager
from typing import List

import httpx
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from database import engine, init_db, get_session
from models import SystemConfig, UpstreamHost

DEFAULT_JAVA_TIMEOUT_SECONDS = 5.0


def seed_default_data(session: Session):
    """初始化默认系统配置与上游主机（若不存在则插入）。"""
    configs = [
        SystemConfig(
            config_key="java_api_timeout",
            config_value="5000",
            description="Java 服务调用超时时间（毫秒）",
            is_active=True,
        ),
    ]
    for cfg in configs:
        statement = select(SystemConfig).where(SystemConfig.config_key == cfg.config_key)
        existing = session.exec(statement).first()
        if not existing:
            session.add(cfg)

    hosts = [
        UpstreamHost(
            name="java-cluster-01",
            host_url=os.getenv("JAVA_HOST", "http://java-service:8080"),
            is_active=True,
        ),
    ]
    for host in hosts:
        statement = select(UpstreamHost).where(UpstreamHost.name == host.name)
        existing = session.exec(statement).first()
        if not existing:
            session.add(host)

    session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with Session(engine) as session:
        seed_default_data(session)
    yield


app = FastAPI(
    title="DataMind BFF",
    description="智能化数据服务轻量级代理系统（Backend For Frontend）",
    version="0.1.0",
    lifespan=lifespan,
)

HTTP_CLIENT = httpx.AsyncClient()


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"服务器内部错误: {str(exc)}", "code": "ERR_INTERNAL"},
    )


def get_java_timeout(session: Session) -> float:
    """从 SQLite 读取 Java 服务调用超时时间，未配置则使用默认值。"""
    statement = select(SystemConfig).where(
        SystemConfig.config_key == "java_api_timeout",
        SystemConfig.is_active == True,
    )
    config = session.exec(statement).first()
    if config:
        try:
            return max(0.1, float(config.config_value) / 1000)
        except (ValueError, TypeError):
            pass
    return DEFAULT_JAVA_TIMEOUT_SECONDS


def get_active_java_hosts(session: Session) -> List[UpstreamHost]:
    """获取所有生效的上游 Java 主机列表。"""
    statement = select(UpstreamHost).where(UpstreamHost.is_active == True)
    return list(session.exec(statement).all())


@app.get("/api/v1/config/{config_key}")
def get_config(
    config_key: str, session: Session = Depends(get_session)
) -> SystemConfig:
    """获取指定系统配置项。"""
    statement = select(SystemConfig).where(
        SystemConfig.config_key == config_key,
        SystemConfig.is_active == True,
    )
    config = session.exec(statement).first()
    if not config:
        raise HTTPException(status_code=404, detail="配置项不存在")
    return config
