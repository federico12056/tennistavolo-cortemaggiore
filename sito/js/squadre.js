
const SUPABASE_URL = "https://jjktajcbtxmyagyexxbj.supabase.co";
const SUPABASE_KEY = "sb_publishable_iuOOYxZ6xQKyddY2SALzLg__pPAayjK";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const contenitore = document.getElementById("elenco-squadre");
const contenitoreGiocatori = document.getElementById("elenco-giocatori-squadre");

// Recupera l'indirizzo pubblico di una fotografia.
function recuperaUrlFoto(percorso) {
    if (!percorso) return null;

    const { data } = supabaseClient
        .storage
        .from("foto-sito")
        .getPublicUrl(percorso);

    return data?.publicUrl || null;
}

// Aggiunge una fotografia a una scheda.
function aggiungiFoto(scheda, foto, descrizione) {
    if (!foto) return;

    const img = document.createElement("img");

    img.src = recuperaUrlFoto(foto.percorso);
    img.alt = foto.testo_alternativo || descrizione;
    img.loading = "lazy";
    img.className = "card-image";

    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "cover";

    scheda.appendChild(img);
}

// Caricamento di tutti i dati dal database.
async function caricaSquadreEGiocatori() {
    try {
        contenitore.innerHTML = "<p>Caricamento delle squadre...</p>";
        contenitoreGiocatori.innerHTML = "<p>Caricamento dei giocatori...</p>";

        // Recupera le squadre attive.
        const { data: squadre, error: erroreSquadre } =
            await supabaseClient
                .from("squadre")
                .select("*")
                .eq("attiva", true)
                .order("ordine", { ascending: true });

        if (erroreSquadre) throw erroreSquadre;

        // Recupera i giocatori attivi.
        const { data: giocatori, error: erroreGiocatori } =
            await supabaseClient
                .from("giocatori")
                .select("*")
                .eq("attivo", true)
                .order("cognome", { ascending: true });

        if (erroreGiocatori) throw erroreGiocatori;

        // Recupera le associazioni tra squadre e giocatori.
        const { data: associazioni, error: erroreAssociazioni } =
            await supabaseClient
                .from("squadra_giocatori")
                .select("squadra_id, giocatore_id, ordine")
                .order("ordine", { ascending: true });

        if (erroreAssociazioni) throw erroreAssociazioni;

        // Recupera esclusivamente le fotografie di squadre e giocatori.
        const { data: fotografie, error: erroreFotografie } =
            await supabaseClient
                .from("foto_sito")
                .select("tipo, elemento_id, percorso, testo_alternativo")
                .in("tipo", ["squadra", "giocatore"]);

        if (erroreFotografie) throw erroreFotografie;

        // Crea una mappa delle fotografie.
        const mappaFotoSquadre = new Map();
        const mappaFotoGiocatori = new Map();

        fotografie.forEach(function(foto) {
            if (foto.tipo === "squadra") {
                mappaFotoSquadre.set(foto.elemento_id, foto);
            }

            if (foto.tipo === "giocatore") {
                mappaFotoGiocatori.set(foto.elemento_id, foto);
            }
        });

        // Crea una mappa dei giocatori.
        const mappaGiocatori = new Map();

        giocatori.forEach(function(giocatore) {
            mappaGiocatori.set(giocatore.id, {
                ...giocatore,
                squadre: []
            });
        });

        // Associa ogni giocatore alle proprie squadre.
        associazioni.forEach(function(associazione) {
            const giocatore = mappaGiocatori.get(
                associazione.giocatore_id
            );

            const squadra = squadre.find(function(elemento) {
                return elemento.id === associazione.squadra_id;
            });

            if (!giocatore || !squadra) return;

            giocatore.squadre.push({
                nome: squadra.nome,
                categoria: squadra.categoria
            });
        });

        // Indicizza le squadre per ID.
        const mappaSquadre = new Map();

        squadre.forEach(function(squadra) {
            mappaSquadre.set(squadra.id, squadra);
        });

        // ==========================================
        // VISUALIZZAZIONE DELLE SQUADRE
        // ==========================================

        contenitore.innerHTML = "";

        if (!squadre.length) {
            contenitore.textContent =
                "Non sono ancora presenti squadre.";
        }

        squadre.forEach(function(squadra) {
            const scheda = document.createElement("article");
            scheda.className = "card";
            scheda.id = "squadra-" + squadra.categoria;

            // Fotografia della squadra.
            const fotoSquadra = mappaFotoSquadre.get(squadra.codice);

            aggiungiFoto(
                scheda,
                fotoSquadra,
                squadra.nome
            );

            // Nome della squadra.
            const titolo = document.createElement("h3");
            titolo.textContent = squadra.nome;

            // Categoria.
            const categoria = document.createElement("p");
            categoria.textContent =
                "Categoria: " + (squadra.categoria || "");

            // Descrizione.
            const descrizione = document.createElement("p");
            descrizione.textContent = squadra.descrizione || "";

            scheda.append(titolo, categoria, descrizione);

            // Collegamento FITeT.
            if (squadra.fitet) {
                const linkFitet = document.createElement("a");

                linkFitet.href = squadra.fitet;
                linkFitet.textContent = "Consulta la scheda FITeT →";
                linkFitet.target = "_blank";
                linkFitet.rel = "noopener noreferrer";

                scheda.appendChild(linkFitet);
            }

            // Rosa della squadra.
            const titoloGiocatori = document.createElement("h4");
            titoloGiocatori.textContent = "Rosa della squadra";

            const elenco = document.createElement("ul");

            const giocatoriSquadra = associazioni
                .filter(function(associazione) {
                    return associazione.squadra_id === squadra.id;
                })
                .map(function(associazione) {
                    return mappaGiocatori.get(
                        associazione.giocatore_id
                    );
                })
                .filter(Boolean);

            giocatoriSquadra.forEach(function(giocatore) {
                const elemento = document.createElement("li");
                const link = document.createElement("a");

                link.href =
    "squadre.html#giocatore-" +
    encodeURIComponent(giocatore.codice);

                link.textContent =
                    giocatore.nome + " " + giocatore.cognome;

                elemento.appendChild(link);
                elenco.appendChild(elemento);
            });

            if (!giocatoriSquadra.length) {
                const elemento = document.createElement("li");
                elemento.textContent = "Nessun giocatore assegnato.";
                elenco.appendChild(elemento);
            }

            scheda.append(titoloGiocatori, elenco);
            contenitore.appendChild(scheda);
        });

        // ==========================================
        // VISUALIZZAZIONE DEI GIOCATORI
        // ==========================================

        contenitoreGiocatori.innerHTML = "";

        const giocatoriUnici = Array.from(mappaGiocatori.values());

        if (!giocatoriUnici.length) {
            contenitoreGiocatori.textContent =
                "Non sono ancora presenti giocatori.";
        }

        giocatoriUnici.forEach(function(giocatore) {
            const scheda = document.createElement("article");
            scheda.className = "card";
            scheda.id = "giocatore-" + giocatore.codice;

            // Fotografia del giocatore.
            const fotoGiocatore = mappaFotoGiocatori.get(
                giocatore.codice
            );

            aggiungiFoto(
                scheda,
                fotoGiocatore,
                giocatore.nome + " " + giocatore.cognome
            );

            // Nome e cognome.
            const nome = document.createElement("h3");
            nome.textContent =
                giocatore.nome + " " + giocatore.cognome;

            // Squadre di appartenenza.
            const appartenenza = document.createElement("p");

            const nomiSquadre = giocatore.squadre.map(function(squadra) {
                return squadra.nome + " (" + squadra.categoria + ")";
            });

            appartenenza.textContent = nomiSquadre.length
                ? "Squadre: " + nomiSquadre.join(", ")
                : "Nessuna squadra assegnata";

            scheda.append(nome, appartenenza);

           

            contenitoreGiocatori.appendChild(scheda);
        });

        // Ripristina eventuali collegamenti diretti.
        if (window.location.hash) {
            const id = decodeURIComponent(
                window.location.hash.slice(1)
            );

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

    } catch (errore) {
        console.error("Errore nel caricamento delle squadre:", errore);

        contenitore.textContent =
            "Si è verificato un errore nel caricamento delle squadre.";

        contenitoreGiocatori.textContent =
            "Si è verificato un errore nel caricamento dei giocatori.";
    }
}

// Avvia il caricamento.
caricaSquadreEGiocatori();