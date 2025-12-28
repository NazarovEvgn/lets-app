from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # Database
    database_url: str

    # Redis
    redis_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # 2GIS API
    dgis_api_key: str

    # CORS
    allowed_origins: str = ""

    # Environment
    environment: str = "development"

    @property
    def allowed_origins_list(self) -> list[str]:
        """
        Get CORS allowed origins based on environment.

        Development: Returns predefined localhost origins for dev apps.
        Production: Returns origins from ALLOWED_ORIGINS env variable.
        """
        if self.environment == "development":
            # Development: explicit localhost origins
            # Use 127.0.0.1 for consistency and to avoid DNS resolution issues
            return [
                "http://127.0.0.1:5173",  # Business app
                "http://127.0.0.1:5174",  # Alternative port
                "http://127.0.0.1:5175",  # Consumer app
                "http://127.0.0.1:8000",  # Backend self-reference
            ]

        # Production: from environment variable
        if not self.allowed_origins:
            return []
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
