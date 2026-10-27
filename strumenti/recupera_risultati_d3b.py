
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

url = "https://portale.fitet.org/risultati/campionati/Calendario.asp?CAM=914&ANNO=41"

risposta = requests.get(url, timeout=30)
risposta.raise_for_status()
pagina = BeautifulSoup(risposta.text, "html.parser")

partite = []
tabelle = pagina.find_all("table")[1:]

for indice, tabella in enumerate(tabelle):
    righe = tabella.find_all("tr")
    giornata = righe[0].get_text(" ", strip=True) if righe else ""

    for riga in righe[1:]:
        valori = [
            cella.get_text(" ", strip=True)
            for cella in riga.find_all("td")
        ]

        if len(valori) < 8:
            continue

        if not valori[0] or not valori[3] or not valori[4]:
            continue

        # Partita di andata
        partite.append({
            "giornata": giornata,
            "data": valori[0],
            "ora": valori[1],
            "risultato": valori[2],
            "casa": valori[3],
            "trasferta": valori[4]
        })

        # Partita di ritorno
        if valori[7]:
            partite.append({
                "giornata": f"{indice + 8}^ Giornata",
                "data": valori[7],
                "ora": valori[6],
                "risultato": valori[5],
                "casa": valori[4],
                "trasferta": valori[3]
            })

destinazione = (
    Path(__file__).resolve().parent.parent
    / "sito"
    / "risultati-d3b.json"
)

with open(destinazione, "w", encoding="utf-8") as file:
    json.dump(partite, file, ensure_ascii=False, indent=2)

print(f"Partite salvate: {len(partite)}")
print(f"File aggiornato: {destinazione}")
print("Giornate:", sorted(set(p["giornata"] for p in partite)))
print("Partite senza risultato:", sum(
    1 for p in partite if p["risultato"].strip() in ("", "-")
))
