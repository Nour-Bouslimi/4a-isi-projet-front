"use strict";

/**
 * Liste centralisée des routes du front.
 *
 * Les valeurs sont toujours écrites depuis la racine du projet.
 * Le préfixe nécessaire est ajouté avec data-base-path.
 */
const FRONT_ROUTES = {
    home: "index.html",
    products: "pages/produits.html",
    menus: "pages/menus.html",
    cart: "pages/panier.html",
    orders: "pages/commandes.html",
    login: "pages/connexion.html",
    register: "pages/inscription.html",
    account: "pages/compte.html",
    admin: "pages/admin/index.html",
    adminProducts: "pages/admin/produits.html",
    adminMenus: "pages/admin/menus.html",
    adminUsers: "pages/admin/utilisateurs.html",
    adminClosures: "pages/admin/fermetures.html",
};

/**
 * Retourne le chemin permettant de revenir à la racine.
 *
 * Exemples :
 * index.html             -> ""
 * pages/produits.html    -> "../"
 * pages/admin/index.html -> "../../"
 */
function obtenirCheminRacine() {
    return document.body.dataset.basePath || "";
}

/**
 * Charge un fichier HTML dans un élément de la page.
 *
 * @param {string} selecteur Sélecteur CSS du conteneur.
 * @param {string} chemin Chemin du composant HTML.
 */
async function chargerComposant(selecteur, chemin) {
    const conteneur = document.querySelector(selecteur);

    if (!conteneur) {
        console.warn(
            `Le conteneur ${selecteur} n'existe pas sur cette page.`
        );

        return;
    }

    try {
        const reponse = await fetch(chemin);

        if (!reponse.ok) {
            throw new Error(
                `Erreur HTTP ${reponse.status} pendant le chargement de ${chemin}.`
            );
        }

        conteneur.innerHTML = await reponse.text();
    } catch (erreur) {
        console.error(erreur);

        conteneur.replaceChildren();

        const message = document.createElement("div");

        message.className = "alert alert-danger m-3";
        message.setAttribute("role", "alert");
        message.textContent =
            "Une partie de l'interface n'a pas pu être chargée.";

        conteneur.appendChild(message);
    }
}

/**
 * Transforme les attributs data-route en véritables liens.
 */
function configurerRoutes() {
    const cheminRacine = obtenirCheminRacine();

    document.querySelectorAll("[data-route]").forEach((lien) => {
        const nomRoute = lien.dataset.route;
        const route = FRONT_ROUTES[nomRoute];

        if (!route) {
            console.warn(`La route "${nomRoute}" est inconnue.`);
            return;
        }

        lien.href = `${cheminRacine}${route}`;
    });
}

/**
 * Retourne le chemin normalisé de la page courante.
 */
function obtenirPageCourante() {
    let chemin = window.location.pathname;

    if (chemin.endsWith("/")) {
        chemin += "index.html";
    }

    return chemin;
}

/**
 * Ajoute la classe active au lien correspondant à la page courante.
 */
function activerLienCourant() {
    const pageCourante = obtenirPageCourante();

    document.querySelectorAll("a[data-route]").forEach((lien) => {
        const urlLien = new URL(lien.href, window.location.href);

        if (urlLien.pathname === pageCourante) {
            lien.classList.add("active");
            lien.setAttribute("aria-current", "page");
        } else {
            lien.classList.remove("active");
            lien.removeAttribute("aria-current");
        }
    });
}

/**
 * Ferme le menu mobile après un clic sur un lien.
 */
function configurerNavigationMobile() {
    const navigation =
        document.getElementById("main-navigation");

    if (!navigation) {
        return;
    }

    navigation.querySelectorAll("a").forEach((lien) => {
        lien.addEventListener("click", () => {
            const menuEstOuvert =
                navigation.classList.contains("show");

            if (menuEstOuvert && window.bootstrap) {
                const collapse =
                    window.bootstrap.Collapse.getOrCreateInstance(
                        navigation
                    );

                collapse.hide();
            }
        });
    });
}

/**
 * Prépare le bouton de déconnexion.
 *
 * La vraie requête vers FastAPI sera ajoutée pendant
 * l'itération consacrée à l'authentification.
 */
function configurerDeconnexion() {
    const bouton =
        document.getElementById("logout-button");

    if (!bouton) {
        return;
    }

    bouton.addEventListener("click", () => {
        console.log(
            "La déconnexion sera connectée à FastAPI ultérieurement."
        );
    });
}

/**
 * Charge le header et le footer, puis configure la navigation.
 */
async function initialiserComposants() {
    const cheminRacine = obtenirCheminRacine();

    await Promise.all([
        chargerComposant(
            "#site-header",
            `${cheminRacine}components/header.html`
        ),
        chargerComposant(
            "#site-footer",
            `${cheminRacine}components/footer.html`
        ),
    ]);

    configurerRoutes();
    activerLienCourant();
    configurerNavigationMobile();
    configurerDeconnexion();

    /*
     * Événement personnalisé :
     * les autres fichiers JavaScript peuvent attendre que
     * les composants partagés soient complètement chargés.
     */
    document.dispatchEvent(
        new CustomEvent("componentsLoaded")
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initialiserComposants
);