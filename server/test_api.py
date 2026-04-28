import requests
import json

r = requests.get('http://127.0.0.1:8001/movies/popular')
d = r.json()
print(f'Total movies: {len(d)}')

movies_with_country = [x for x in d if x.get('origin_country')]
movies_with_genres = [x for x in d if x.get('genres')]
movies_with_both = [x for x in d if x.get('origin_country') and x.get('genres')]

print(f'Movies with origin_country: {len(movies_with_country)}')
print(f'Movies with genres: {len(movies_with_genres)}')
print(f'Movies with both: {len(movies_with_both)}')

if d:
    print('\nFirst movie sample:')
    print(json.dumps(d[0], indent=2, ensure_ascii=False))

    if movies_with_both:
        print('\nFirst movie with both fields:')
        print(json.dumps(movies_with_both[0], indent=2, ensure_ascii=False))