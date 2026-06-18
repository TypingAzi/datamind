from typing import Optional
from sqlmodel import Field, SQLModel


class SystemConfig(SQLModel, table=True):
    """
    本地系统配置表：用于存储前端所需的动态配置或 Java 服务的环境变量覆盖。
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    config_key: str = Field(
        index=True, unique=True, description="配置键名，如 'java_api_timeout'"
    )
    config_value: str = Field(description="配置项的值")
    description: Optional[str] = Field(default=None, description="配置项的业务用途说明")
    is_active: bool = Field(default=True, description="是否生效")


class UpstreamHost(SQLModel, table=True):
    """
    上游 Java 服务主机表：支持多个后端 Java 主机地址，便于后续负载均衡或按业务路由。
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(description="主机别名，如 'java-cluster-01'")
    host_url: str = Field(description="Java 服务基础地址，如 'http://java-service-01:8080'")
    is_active: bool = Field(default=True, description="是否生效")
