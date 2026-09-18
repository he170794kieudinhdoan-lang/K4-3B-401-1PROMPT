"""Run: uvicorn backend.app:app --host 127.0.0.1 --port 8000."""
import os
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Literal
from dotenv import load_dotenv

load_dotenv()
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from .agent import run_agent


class RequestBody(BaseModel):
    model_config=ConfigDict(extra='forbid')
    requestId: str=Field(min_length=1,max_length=100)
    message: str=Field(default='',max_length=500)
    contextVersion: int=Field(ge=0)
    positionRevision: int=Field(default=0,ge=0)
    context: dict=Field(default_factory=dict)
    action: dict | None=None
    schemaVersion: Literal[2]=2


app=FastAPI(title='Vmap bounded LangGraph agent')
requests_by_ip=defaultdict(deque)


@app.middleware('http')
async def bounds(request: Request, call_next):
    if request.url.path=='/api/agent':
        body=await request.body()
        if len(body)>8192:
            return JSONResponse({'detail':'Request body exceeds 8 KB'},status_code=413)
        ip=request.client.host if request.client else 'local'
        now=time.monotonic()
        history=requests_by_ip[ip]
        while history and history[0]<now-60: history.popleft()
        if len(history)>=int(os.getenv('VMAP_RATE_LIMIT','30')):
            return JSONResponse({'detail':'Too many requests; retry later'},status_code=429)
        history.append(now)
    response=await call_next(request)
    response.headers['X-Content-Type-Options']='nosniff'
    return response


@app.get('/api/health')
def health():
    return {'status':'ok','agentFramework':'langgraph','providerMode':os.getenv('VMAP_AGENT_MODE','unconfigured'),'dataMode':'simulated'}


@app.post('/api/agent')
def agent(body: RequestBody):
    return run_agent(body.model_dump())


app.mount('/',StaticFiles(directory=Path(__file__).resolve().parents[1]/'codebase',html=True),name='ui')
