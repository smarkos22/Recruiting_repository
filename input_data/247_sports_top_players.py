import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, FeatureNotFound

BASE_URL = "https://247sports.com"
RANKINGS_URLS = {
    2026: "https://247sports.com/season/2026-football/recruitrankings/?InstitutionGroup=HighSchool",
    2027: "https://247sports.com/season/2027-football/recruitrankings/?InstitutionGroup=HighSchool",
    2028: "https://247sports.com/season/2028-football/recruitrankings/?InstitutionGroup=HighSchool",
}
BASE_DIR = Path(__file__).parent
OUTPUT_PATH = BASE_DIR / "247sports_players_clean.json"

HEADERS = {
    # Use a realistic browser header to avoid basic bot blocking
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://247sports.com/",
    "DNT": "1",
}

REQUEST_DELAY = 2  # seconds between requests


def log_info(message):
    print(f"[INFO] {message}")


def log_error(message):
    print(f"[ERROR] {message}")


def get_soup(url, attempts=3):
    """
    Fetches a URL with basic retry and returns parsed HTML.
    """
    last_error = None

    for attempt in range(1, attempts + 1):
        log_info(f"Fetching {url} (attempt {attempt}/{attempts})")
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            response.raise_for_status()
            time.sleep(REQUEST_DELAY)
            try:
                return BeautifulSoup(response.text, "lxml")
            except FeatureNotFound:
                log_error("lxml parser missing; falling back to built-in html.parser")
                return BeautifulSoup(response.text, "html.parser")
        except requests.HTTPError as exc:
            last_error = exc
            # On 403/429, wait a bit and retry with same headers.
            log_error(f"HTTP error for {url}: {exc}")
            time.sleep(REQUEST_DELAY + 1)

    raise last_error if last_error else RuntimeError(f"Failed to fetch {url}")


def get_top_players(rankings_url, limit=None):
    """
    Scrapes the rankings page and returns a list of dicts:
    [{name, profile_url}]
    """
    soup = get_soup(rankings_url)
    players = []

    rows = soup.select("li.rankings-page__list-item")
    if limit:
        rows = rows[:limit]

    for row in rows:
        link = row.select_one("a.rankings-page__name-link")
        if not link:
            continue

        name = link.get_text(strip=True)
        profile_url = urljoin(BASE_URL, link["href"])

        players.append({
            "name": name,
            "profile_url": profile_url
        })

    log_info(f"Found {len(players)} players on rankings page")
    return players


def extract_player_bio(profile_url):
    """
    Extracts Position, Height, Weight, City, High School, Class
    and rating fields from the player profile page.
    """
    soup = get_soup(profile_url)

    def normalize_label(label):
        normalized = label.lower()
        if normalized in {"pos", "position"}:
            return "Position"
        if normalized in {"ht", "height"}:
            return "Height"
        if normalized in {"wt", "weight"}:
            return "Weight"
        if normalized in {"hs", "high school", "school"}:
            return "High School"
        if normalized in {"city", "hometown"}:
            return "City"
        if normalized in {"class", "grad year"}:
            return "Class"
        return None

    def add_if_missing(container, key, value):
        if key and value and not container.get(key):
            container[key] = value

    def label_value_from_text(text):
        # Try to split on common separators; otherwise assume first token is label.
        for sep in (":", "-"):
            if sep in text:
                label, val = text.split(sep, 1)
                return label.strip(), val.strip()
        parts = text.split()
        if len(parts) >= 2:
            return parts[0], " ".join(parts[1:])
        return None, None

    bio = {}

    # First attempt: structured player bio list.
    for item in soup.select("ul.player-bio__list li"):
        label = item.select_one(".player-bio__label")
        value = item.select_one(".player-bio__value")
        if label and value:
            norm = normalize_label(label.get_text(strip=True))
            add_if_missing(bio, norm, value.get_text(strip=True))

    # Fallback: use header ULs indicated by the provided XPaths.
    # UL 1 -> Position/Height/Weight (by index); UL 3 -> High School/City/Class (by index).
    header_uls = soup.select("#page-content section header div ul")
    if len(header_uls) >= 1:
        li_items = header_uls[0].select("li")
        idx_map = {0: "Position", 1: "Height", 2: "Weight"}
        for i, li in enumerate(li_items):
            key = idx_map.get(i)
            val = " ".join(li.stripped_strings)
            add_if_missing(bio, key, val)

    if len(header_uls) >= 3:
        li_items = header_uls[2].select("li")
        idx_map = {0: "High School", 1: "City", 2: "Class"}
        for i, li in enumerate(li_items):
            key = idx_map.get(i)
            val = " ".join(li.stripped_strings)
            add_if_missing(bio, key, val)

    def extract_ratings():
        composite = None
        rating_247 = None

        # Primary: pick the first two rank-blocks in the header ratings section.
        rank_blocks = soup.select("#page-content .rank-block")
        texts = ["".join(block.stripped_strings) for block in rank_blocks if block.get_text(strip=True)]
        if len(texts) >= 2:
            composite = texts[0].strip()
            rating_247 = texts[1].strip()

        # Fallback: search by text labels if needed.
        if composite is None:
            label = soup.find(string=re.compile("247sports composite", re.IGNORECASE))
            if label:
                value_el = label.find_parent().find_next(string=re.compile(r"\d"))
                composite = value_el.strip() if value_el else None

        if rating_247 is None:
            label = soup.find(string=re.compile("247sports player rating|247sports rating", re.IGNORECASE))
            if label:
                value_el = label.find_parent().find_next(string=re.compile(r"\d"))
                rating_247 = value_el.strip() if value_el else None

        return composite, rating_247

    comp_rating, player_rating = extract_ratings()
    if comp_rating:
        bio["Composite Rating"] = comp_rating
    if player_rating:
        bio["247Sports Rating"] = player_rating

    return bio


def parse_position(raw):
    if not raw:
        return None
    text = raw.strip()
    text = re.sub(r"^(?:pos(?:ition)?)[:\s-]*", "", text, flags=re.IGNORECASE).strip()
    match = re.search(r"[A-Za-z]{1,4}(?:/[A-Za-z]{1,4})*", text)
    return match.group(0) if match else (text if text else None)


def parse_height(raw):
    if not raw:
        return None
    text = re.sub(r"^(?:height)[:\s-]*", "", raw, flags=re.IGNORECASE)
    text = text.split("/")[0]  # drop any trailing weight part like "6-3 / 185"
    match = re.search(r"(?P<feet>\d+)\s*[-']\s*(?P<inches>\d+(?:\.\d+)?)", text)
    if not match:
        return None
    try:
        feet = int(match.group("feet"))
        inches_val = float(match.group("inches"))
        inches = int(round(inches_val))
        return {"feet": feet, "inches": inches}
    except (TypeError, ValueError):
        return None


def parse_weight(raw):
    if not raw:
        return None
    text = re.sub(r"^(?:weight)[:\s-]*", "", raw, flags=re.IGNORECASE)
    match = re.search(r"(\d+)", text.replace(",", ""))
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def parse_rating(raw):
    if not raw:
        return None
    try:
        return float(raw)
    except ValueError:
        # Sometimes ratings might have commas or stray characters; strip non-numeric except dot.
        cleaned = re.sub(r"[^0-9.]", "", raw)
        try:
            return float(cleaned)
        except ValueError:
            return None


def parse_class(raw):
    if not raw:
        return None
    text = re.sub(r"^(?:class)[:\s-]*", "", raw, flags=re.IGNORECASE)
    match = re.search(r"(\d{4})", text)
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def clean_city(raw):
    if not raw:
        return None
    return re.sub(r"^city[:\s-]*", "", raw, flags=re.IGNORECASE).strip() or None


def clean_high_school(raw):
    if not raw:
        return None
    return re.sub(r"^high school[:\s-]*", "", raw, flags=re.IGNORECASE).strip() or None


def clean_player(player):
    return {
        "name": player.get("name"),
        "profile_url": player.get("profile_url"),
        "Position": parse_position(player.get("Position")),
        "Height": parse_height(player.get("Height")),
        "Weight": parse_weight(player.get("Weight")),
        "City": clean_city(player.get("City")),
        "High School": clean_high_school(player.get("High School")),
        "Class": parse_class(player.get("Class")),
        "Composite Rating": parse_rating(player.get("Composite Rating")),
        "247Sports Rating": parse_rating(player.get("247Sports Rating")),
    }


def main():
    results = []
    failures = []

    for year, rankings_url in RANKINGS_URLS.items():
        log_info(f"Scraping rankings for class {year}")
        players = get_top_players(rankings_url)

        for idx, player in enumerate(players, start=1):
            log_info(f"[{idx}/{len(players)}] ({year}) Scraping {player['name']}")

            try:
                raw_bio = extract_player_bio(player["profile_url"])
                raw_player = {
                    "name": player["name"],
                    "profile_url": player["profile_url"],
                    "class_year": year,
                    **raw_bio,
                }
                cleaned = clean_player(raw_player)
                cleaned["Class Year"] = year
                results.append(cleaned)
            except Exception as exc:  # noqa: BLE001
                log_error(f"Failed to scrape {player['name']} ({year}): {exc}")
                failures.append({"name": player["name"], "year": year, "error": str(exc)})
                continue

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    log_info(f"Data saved to {OUTPUT_PATH} ({len(results)} players)")
    if failures:
        log_error(f"Failed on {len(failures)} players")
        for failure in failures:
            log_error(f"- ({failure['year']}) {failure['name']}: {failure['error']}")


if __name__ == "__main__":
    main()
