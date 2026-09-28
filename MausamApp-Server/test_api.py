import requests

res = requests.post(
    'http://127.0.0.1:8001/api/action-cards',
    json={
        'persona': 'Commuter',
        'time_of_day': 'Morning',
        'location': 'Pune',
        'latitude': 18.52,
        'longitude': 73.85
    }
)
print(res.json())
