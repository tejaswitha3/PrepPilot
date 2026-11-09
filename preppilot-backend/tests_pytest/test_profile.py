def register_and_login(client, name, email):
    registered = client.post(
        '/api/auth/register',
        json={
            'name': name,
            'email': email,
            'password': 'secure123',
            'confirm_password': 'secure123',
        },
    )
    assert registered.status_code == 201
    logged_in = client.post(
        '/api/auth/login',
        json={'email': email, 'password': 'secure123'},
    )
    return logged_in.json['access_token']


def auth(token):
    return {'Authorization': 'Bearer ' + token}


def test_profile_reads_and_updates_only_current_user(client):
    first_token = register_and_login(client, 'First', 'first-profile@example.com')
    second_token = register_and_login(client, 'Second', 'second-profile@example.com')

    first_profile = client.get('/api/profile', headers=auth(first_token))
    changed = client.put(
        '/api/profile',
        headers=auth(first_token),
        json={'name': 'Updated First'},
    )
    second_profile = client.get('/api/profile', headers=auth(second_token))

    assert first_profile.status_code == 200
    assert first_profile.json['user']['name'] == 'First'
    assert changed.status_code == 200
    assert changed.json['user']['name'] == 'Updated First'
    assert second_profile.status_code == 200
    assert second_profile.json['user']['name'] == 'Second'


def test_profile_requires_authentication_and_valid_name(client):
    assert client.get('/api/profile').status_code == 401
    token = register_and_login(client, 'Profile', 'profile-validation@example.com')
    invalid = client.put('/api/profile', headers=auth(token), json=['not', 'an', 'object'])
    too_long = client.put('/api/profile', headers=auth(token), json={'name': 'N' * 121})

    assert invalid.status_code == 400
    assert too_long.status_code == 400
