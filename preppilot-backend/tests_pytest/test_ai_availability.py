def test_ai_endpoint_explains_missing_provider_key(client, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    client.post(
        "/api/auth/register",
        json={
            "name": "Student",
            "email": "student@example.com",
            "password": "secure123",
            "confirm_password": "secure123",
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "student@example.com", "password": "secure123"},
    )
    headers = {"Authorization": "Bearer " + login.json["access_token"]}

    status = client.get("/api/chat/status", headers=headers)
    response = client.post("/api/chat", headers=headers, json={"message": "Help me study"})

    assert status.status_code == 200
    assert status.json == {"available": False}
    assert response.status_code == 503
    assert "OPENAI_API_KEY" in response.json["error"]
