
const contenitore = document.getElementById("elenco-squadre");
const contenitoreGiocatori = document.getElementById("elenco-giocatori-squadre");

if (contenitore && typeof squadre !== "undefined") {
    contenitore.innerHTML = "";

    const giocatoriUnici = new Map();

    squadre.forEach(function(squadra) {
        const scheda = document.createElement("article");
        scheda.className = "card";
        scheda.id = "squadra-" + squadra.categoria;

        const titolo = document.createElement("h3");
        titolo.textContent = squadra.nome;

        const categoria = document.createElement("p");
        categoria.textContent = "Categoria: " + squadra.categoria;

        const descrizione = document.createElement("p");
        descrizione.textContent = squadra.descrizione || "";

        scheda.append(titolo, categoria, descrizione);

        if (squadra.fitet) {
            const linkFitet = document.createElement("a");
            linkFitet.href = squadra.fitet;
            linkFitet.textContent = "Consulta la scheda FITeT →";
            linkFitet.target = "_blank";
            linkFitet.rel = "noopener noreferrer";
            scheda.appendChild(linkFitet);
        }

        const titoloGiocatori = document.createElement("h4");
        titoloGiocatori.textContent = "Rosa della squadra";

        const elenco = document.createElement("ul");

        (squadra.giocatori || []).forEach(function(giocatore) {
            const elemento = document.createElement("li");
            const link = document.createElement("a");

            link.href = "giocatori.html#" + encodeURIComponent(giocatore.id);
            link.textContent = giocatore.nome;

            elemento.appendChild(link);
            elenco.appendChild(elemento);

            if (!giocatoriUnici.has(giocatore.id)) {
                giocatoriUnici.set(giocatore.id, {
                    ...giocatore,
                    squadre: []
                });
            }

            const giocatoreUnico = giocatoriUnici.get(giocatore.id);
            if (!giocatoreUnico.squadre.includes(squadra.nome)) {
                giocatoreUnico.squadre.push(squadra.nome);
            }
        });

        scheda.append(titoloGiocatori, elenco);
        contenitore.appendChild(scheda);
    });

    if (contenitoreGiocatori) {
        contenitoreGiocatori.innerHTML = "";

        giocatoriUnici.forEach(function(giocatore) {
            const scheda = document.createElement("article");
            scheda.className = "card";

            const nome = document.createElement("h3");
            nome.textContent = giocatore.nome;

            const appartenenza = document.createElement("p");
            appartenenza.textContent =
                "Squadra: " + giocatore.squadre.join(", ");

            const link = document.createElement("a");
            link.href = "giocatori.html#" + encodeURIComponent(giocatore.id);
            link.textContent = "Scheda giocatore →";

            scheda.append(nome, appartenenza, link);
            contenitoreGiocatori.appendChild(scheda);
        });

        if (giocatoriUnici.size === 0) {
            contenitoreGiocatori.textContent =
                "Non sono ancora presenti giocatori.";
        }
    }
}

// Se si arriva con un collegamento diretto a una squadra,
// porta alla relativa scheda.
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
