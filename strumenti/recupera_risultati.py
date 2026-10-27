
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

url = "https://portale.fitet.org/risultati/campionati/Calendario.asp?CAM=903&ANNO=41"

risposta = requests.get(url, timeout=20)
risposta.raise_for_status()

pagina = BeautifulSoup(risposta.text, "html.parser")

partite = []

for tabella in pagina.find_all("table")[1:]:
    righe = tabella.find_all("tr")

    giornata = ""
    if righe:
        giornata = righe[0].get_text(" ", strip=True)

    for riga in righe[1:]:
        celle = riga.find_all("td")
        valori = [cella.get_text(" ", strip=True) for cella in celle]

        if len(valori) < 5:
            continue

        if not valori[0] or not valori[3] or not valori[4]:
            continue

        partite.append({
            "giornata": giornata,
            "data": valori[0],
            "ora": valori[1],
            "risultato": valori[2],
            "casa": valori[3],
            "trasferta": valori[4]
        })

destinazione = Path(__file__).resolve().parent.parent / "risultati-d1.json"

with open(destinazione, "w", encoding="utf-8") as file:
    json.dump(partite, file, ensure_ascii=False, indent=2)

print(f"Partite salvate: {len(partite)}")
print(f"File creato: {destinazione}")
print("\nPrime tre partite:")

for partita in partite[:3]:
    print(partita)
