"use strict";

document.addEventListener("DOMContentLoaded", () => {
    console.log("La page d'accueil est chargée.");
});

document.addEventListener("componentsLoaded", () => {
    console.log(
        "Le header et le footer partagés sont chargés."
    );
});