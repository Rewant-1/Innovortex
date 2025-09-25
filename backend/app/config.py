from functools import lru_cache
from typing import Optional

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    climatIq_api_key: Optional[str] = Field(default=None, alias="CLIMATIQ_API_KEY")
    climatIq_api_key_legacy: Optional[str] = Field(default=None, alias="CLIMATIQ")
    climatiq_base_url: str = Field(
        default="https://api.climatiq.io/data/v1/estimate",
        alias="CLIMATIQ_BASE_URL",
    )
    google_api_key: Optional[str] = Field(default=None, alias="GOOGLE_API_KEY")
    weather_user_agent: str = Field(default="EcoImpactApp/1.0", alias="WEATHER_USER_AGENT")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def resolved_climatiq_api_key(self) -> Optional[str]:
        return self.climatIq_api_key or self.climatIq_api_key_legacy


@lru_cache
def get_settings() -> Settings:
    return Settings()


class GeminiResult(BaseModel):
    text: str
    confidence: float
