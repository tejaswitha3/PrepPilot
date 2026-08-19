import os
import requests
from app.services.context_service import analyze_message_for_context, get_last_incorrect_attempt_with_question, get_study_suggestions_context

# Simple wrapper around an OpenAI-compatible Chat Completions HTTP API.
# Configure with environment variables:
# OPENAI_API_KEY, OPENAI_API_BASE (optional), OPENAI_MODEL (optional)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_API_BASE = os.getenv('OPENAI_API_BASE', 'https://api.openai.com/v1')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

# System prompt for Preppilot AI (can be overridden via env PREPPILOT_AI_SYSTEM_PROMPT)
SYSTEM_PROMPT = os.getenv('PREPPILOT_AI_SYSTEM_PROMPT',
                           'You are Preppilot AI, an assistant that helps students prepare for technical interviews, coding, aptitude, and behavioral interviews. Provide clear, concise, and empathy-driven guidance, include study pointers, and avoid fabricating specifics about companies. When appropriate, include example problems or short code snippets.')


def chat_completion(user_messages, max_tokens=512, temperature=0.2):
    """Call the external LLM provider's chat completion endpoint.

    user_messages: list of dicts like [{"role": "user", "content": "..."}, ...]
    Returns assistant text on success, raises RuntimeError on failure.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError('OPENAI_API_KEY not configured')

    url = f"{OPENAI_API_BASE}/chat/completions"
    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json',
    }

    # Prepend system prompt
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}] + user_messages

    payload = {
        'model': OPENAI_MODEL,
        'messages': messages,
        'max_tokens': max_tokens,
        'temperature': temperature,
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f'LLM provider returned {resp.status_code}: {resp.text}')

    data = resp.json()
    # Expecting OpenAI-style response
    try:
        choice = data['choices'][0]
        content = choice['message']['content']
        return content
    except Exception as e:
        raise RuntimeError(f'Unexpected response shape: {e} - {data}')


def generate_reply(user_id: int, user_text: str, max_tokens=512, temperature=0.2):
    """Build context-aware messages and call the LLM provider.

    Behavior:
    - Always include `SYSTEM_PROMPT`.
    - If the user's message indicates a context-aware intent, fetch context and include a context block before the user's message.
    """
    if not OPENAI_API_KEY:
        raise RuntimeError('OPENAI_API_KEY not configured')

    intent = analyze_message_for_context(user_text)
    context_block = None
    if intent == 'explain_attempt':
        ctx = get_last_incorrect_attempt_with_question(user_id)
        if ctx:
            q = ctx['question']
            a = ctx['attempt']
            context_block = (
                f"USER_LAST_INCORRECT_ATTEMPT:\nQuestion ID: {q['id']}\nQuestion: {q['question_text']}\n"
                f"Options: {q['options']}\nUser selected: {a['selected_answer']}\nCorrect answer: {q['correct_answer']}\n"
                f"Existing explanation: {q.get('explanation')}"
            )
    elif intent == 'study_suggestions':
        stats = get_study_suggestions_context(user_id)
        context_block = f"USER_STUDY_SUGGESTIONS_CONTEXT:\n{stats}"

    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
    if context_block:
        messages.append({'role': 'system', 'content': f'CONTEXT:\n{context_block}'})
    messages.append({'role': 'user', 'content': user_text})

    # Call provider
    url = f"{OPENAI_API_BASE}/chat/completions"
    headers = {
        'Authorization': f'Bearer {OPENAI_API_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': OPENAI_MODEL,
        'messages': messages,
        'max_tokens': max_tokens,
        'temperature': temperature,
    }

    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f'LLM provider returned {resp.status_code}: {resp.text}')

    data = resp.json()
    try:
        choice = data['choices'][0]
        content = choice['message']['content']
        return content
    except Exception as e:
        raise RuntimeError(f'Unexpected response shape: {e} - {data}')
