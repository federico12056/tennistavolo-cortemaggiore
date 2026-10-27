
const contenitore = document.getElementById("elenco-giocatori");

contenitore.innerHTML = "";

// Raccoglie i giocatori di tutte le squadre,
// evitando di creare schede duplicate.
const giocatoriUnici = new Map();

squadre.forEach(function(squadra) {
    squadra.giocatori.forEach(function(giocatore) {
        if (!giocatoriUnici.has(giocatore.id)) {
            giocatoriUnici.set(giocatore.id, {
                ...giocatore,
                squadre: []
            });
        }

        const datiGiocatore = giocatoriUnici.get(giocatore.id);

        const nomeSquadra =
            squadra.nome + " (" + squadra.categoria + ")";

        if (!datiGiocatore.squadre.some(function(s) {
            return s.categoria === squadra.categoria;
        })) {
            datiGiocatore.squadre.push({
                nome: nomeSquadra,
                categoria: squadra.categoria
            });
        }
    });
});

// Crea le schede dei giocatori.
giocatoriUnici.forEach(function(giocatore) {
    const scheda = document.createElement("article");
    scheda.className = "card";
    scheda.id = giocatore.id;

    const nome = document.createElement("h2");
    nome.textContent = giocatore.nome;

    const titoloSquadre = document.createElement("h3");
    titoloSquadre.textContent = "Squadra di appartenenza";

    const elencoSquadre = document.createElement("ul");

    giocatore.squadre.forEach(function(squadra) {
        const elemento = document.createElement("li");

        const linkSquadra = document.createElement("a");
        linkSquadra.href =
            "squadre.html#squadra-" + squadra.categoria;
        linkSquadra.textContent = squadra.nome;

        elemento.appendChild(linkSquadra);
        elencoSquadre.appendChild(elemento);
    });

    scheda.append(nome, titoloSquadre, elencoSquadre);
    contenitore.appendChild(scheda);
});

// Porta in vista il giocatore indicato nell'URL.
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
