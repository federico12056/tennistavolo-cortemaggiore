
const contenitore = document.getElementById("elenco-squadre");

contenitore.innerHTML = "";

squadre.forEach(function(squadra) {
    const scheda = document.createElement("article");
    scheda.className = "card";

    // Identificativo univoco della squadra,
    // utilizzato per raggiungerla direttamente.
    scheda.id = "squadra-" + squadra.categoria;

    const titolo = document.createElement("h2");
    titolo.textContent = squadra.nome;

    const categoria = document.createElement("p");
    categoria.textContent = "Categoria: " + squadra.categoria;

    const descrizione = document.createElement("p");
    descrizione.textContent = squadra.descrizione;

    scheda.append(titolo, categoria, descrizione);

    // Collegamento alla scheda FITeT, se presente.
    if (squadra.fitet) {
        const linkFitet = document.createElement("a");

        linkFitet.href = squadra.fitet;
        linkFitet.textContent = "Consulta la scheda FITeT →";
        linkFitet.target = "_blank";
        linkFitet.rel = "noopener noreferrer";

        linkFitet.style.display = "inline-block";
        linkFitet.style.marginBottom = "16px";

        scheda.appendChild(linkFitet);
    }

    const titoloGiocatori = document.createElement("h3");
    titoloGiocatori.textContent = "Giocatori";

    const elencoGiocatori = document.createElement("ul");

    squadra.giocatori.forEach(function(giocatore) {
        const elemento = document.createElement("li");

        const linkGiocatore = document.createElement("a");
        linkGiocatore.href = "giocatori.html#" + giocatore.id;
        linkGiocatore.textContent = giocatore.nome;

        elemento.appendChild(linkGiocatore);
        elencoGiocatori.appendChild(elemento);
    });

    scheda.append(titoloGiocatori, elencoGiocatori);
    contenitore.appendChild(scheda);
});

// Se si arriva da un link con #squadra-CATEGORIA,
// porta direttamente alla scheda della squadra.
if (window.location.hash) {
    const id = decodeURIComponent(window.location.hash.slice(1));

    requestAnimationFrame(function() {
        const scheda = document.getElementById(id);

        if (scheda) {
            scheda.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

