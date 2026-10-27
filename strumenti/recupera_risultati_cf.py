
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

url = "https://portale.fitet.org/risultati/campionati/Calendario.asp?CAM=921&ANNO=41"

risposta = requests.get(url, timeout=30)
risposta.raise_for_status()
pagina = BeautifulSoup(risposta.text, "html.parser")

partite = []

for tabella in pagina.find_all("table")[1:]:
    righe = tabella.find_all("tr")
    giornata = ""

    for riga in righe:
        valori = [
            cella.get_text(" ", strip=True)
            for cella in riga.find_all("td")
        ]

        testo = riga.get_text(" ", strip=True)

        if "Giornata" in testo:
            import re
            corrispondenza = re.search(r"\d+\s*\^\s*Giornata", testo)
            if corrispondenza:
                giornata = corrispondenza.group(0)

        if len(valori) >= 5 and valori[0] and valori[3] and valori[4]:
            partite.append({
                "giornata": giornata,
                "data": valori[0],
                "ora": valori[1],
                "risultato": valori[2],
                "casa": valori[3],
                "trasferta": valori[4]
            })

destinazione = (
    Path(__file__).resolve().parent.parent
    / "sito"
    / "risultati-cf.json"
)

with open(destinazione, "w", encoding="utf-8") as file:
    json.dump(partite, file, ensure_ascii=False, indent=2)

print(f"Partite salvate: {len(partite)}")
print(f"File aggiornato: {destinazione}")
print("Giornate:", sorted(set(p["giornata"] for p in partite)))
print("Partite senza risultato:", sum(
    1 for p in partite if p["risultato"].strip() in ("", "-")
))
