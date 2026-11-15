"""Talks to the Groq chat API. Retries once on 429 and timeouts, and cleans up JSON replies."""
import json
import logging
import re
import time

import requests

from config import settings

log = logging.getLogger("circuit-sages")
URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqError(Exception):
    """Carries a message that is safe to show to the user."""


def chat(messages: list, max_tokens: int, json_mode: bool = False) -> str:
    if not settings.groq_api_key:
        raise GroqError("The language model is not set up yet: GROQ_API_KEY is missing from .env.")
    body = {
        "model": settings.groq_model,
        "messages": messages,
        "max_completion_tokens": max_tokens,
        "temperature": 0,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}
    headers = {"Authorization": f"Bearer {settings.groq_api_key}"}

    for attempt in range(settings.groq_max_retries + 1):
        try:
            resp = requests.post(URL, json=body, headers=headers, timeout=settings.groq_timeout)
        except requests.Timeout as exc:
            if attempt < settings.groq_max_retries:
                continue
            raise GroqError("The language model took too long to answer. Please try again or pick a preset.") from exc
        except requests.RequestException as exc:
            raise GroqError("Could not reach the language model service. Check your internet and try again.") from exc

        if resp.status_code == 429:
            if attempt < settings.groq_max_retries:
                time.sleep(min(float(resp.headers.get("retry-after", 3)), 10))
                continue
            raise GroqError("The language model service is busy right now. Try a preset question in a minute.")
        if resp.status_code != 200:
            log.error("Groq returned %s: %s", resp.status_code, resp.text[:300])
            raise GroqError("The language model service returned an error. Please try again.")

        content = resp.json()["choices"][0]["message"].get("content") or ""
        if not content.strip():
            raise GroqError("The language model returned an empty answer. Please try again.")
        return content
    raise GroqError("The language model service is busy right now. Please try again shortly.")


def parse_json(text: str) -> dict:
    """Pull a JSON object out of a model reply. Handles <think> blocks and code fences."""
    cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.S | re.I)
    cleaned = re.sub(r"```(?:json)?", "", cleaned).strip()
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start == -1 or end <= start:
        log.warning("No JSON object in model reply: %r", text[:500])
        raise ValueError("no JSON object found")
    try:
        return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        log.warning("Bad JSON from model: %r", text[:500])
        raise ValueError("invalid JSON") from exc
