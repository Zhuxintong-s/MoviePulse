import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("TMDB_API_KEY")
print(f"Using API Key: {api_key}")

url = f"https://api.themoviedb.org/3/movie/popular?api_key={api_key}&page=1"
print(f"Requesting URL: {url}")

try:
    proxies = None
    proxy_url = os.getenv("HTTP_PROXY")
    if proxy_url:
        proxies = {"http": proxy_url, "https": proxy_url}
        print(f"Using Proxy: {proxy_url}")
        
    # Adding a timeout to see if it's a connection issue
    response = requests.get(url, timeout=10, proxies=proxies)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Successfully fetched {len(data.get('results', []))} movies.")
    else:
        print(f"Error Response: {response.text}")
except requests.exceptions.Timeout:
    print("Error: The request timed out. Your network might be blocking access to api.themoviedb.org.")
except requests.exceptions.ConnectionError as e:
    print(f"Error: Connection Error. {e}")
except Exception as e:
    print(f"Exception: {e}")
