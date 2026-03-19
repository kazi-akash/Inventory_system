"""Token schemas"""

from pydantic import BaseModel


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str
    exp: int
    type: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str
