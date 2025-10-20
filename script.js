// Attend que le contenu de la page soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // === NOUVELLE LOGIQUE DE MOT DE PASSE ===
    const correctPassword = "250273"; // Voici le mot de passe
    const loginOverlay = document.getElementById('login-overlay');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const appContent = document.getElementById('app-content');

    // Vérifie si l'utilisateur est déjà authentifié (dans la session)
    // S'il ferme l'onglet, il devra remettre le mot de passe.
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        showApp();
    }

    // Gère la soumission du formulaire de mot de passe
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;

        if (enteredPassword === correctPassword) {
            // Mot de passe correct
            sessionStorage.setItem('isAuthenticated', 'true'); // On sauvegarde dans la session
            showApp();
        } else {
            // Mot de passe incorrect
            passwordError.textContent = 'Mot de passe incorrect.';
            passwordError.style.display = 'block'; // Affiche le message d'erreur
            passwordInput.focus(); // Remet le curseur dans le champ
        }
    });

    /**
     * Cache l'overlay de login et affiche le contenu de l'application
     */
    function showApp() {
        loginOverlay.style.display = 'none'; // Cache l'overlay
        appContent.classList.remove('hidden'); // Affiche le contenu
        initializeApp(); // Démarre la logique de l'agenda
    }
    // =========================================


    /**
     * Initialise toute la logique de l'agenda
     * (C'est tout le code de l'étape précédente, mis dans une fonction)
     */
    function initializeApp() {
        // Récupère les éléments du DOM (la page HTML)
        const eventForm = document.getElementById('event-form');
        const eventDateInput = document.getElementById('event-date');
        const eventTimeInput = document.getElementById('event-time');
        const eventDescInput = document.getElementById('event-desc');
        const eventList = document.getElementById('event-list');

        // Charge les événements depuis le localStorage au démarrage
        loadEvents();

        // Ajoute un écouteur d'événement sur la soumission du formulaire
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newEvent = {
                id: Date.now(),
                date: eventDateInput.value,
                time: eventTimeInput.value,
                description: eventDescInput.value
            };

            addEventToLocalStorage(newEvent);
            eventForm.reset();
        });

        /**
         * Charge et affiche tous les événements depuis le localStorage.
         */
        function loadEvents() {
            const events = getEventsFromLocalStorage();
            events.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
            eventList.innerHTML = '';
            events.forEach(event => {
                addEventToDOM(event);
            });
        }

        /**
         * Récupère les événements depuis le localStorage.
         */
        function getEventsFromLocalStorage() {
            return JSON.parse(localStorage.getItem('calendarEvents')) || [];
        }

        /**
         * Ajoute un événement au localStorage et met à jour l'affichage.
         */
        function addEventToLocalStorage(event) {
            const events = getEventsFromLocalStorage();
            events.push(event);
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            loadEvents();
        }

        /**
         * Crée les éléments HTML pour un événement et l'ajoute à la page.
         */
        function addEventToDOM(event) {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');

            const eventDate = new Date(event.date + 'T' + event.time);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = eventDate.toLocaleDateString('fr-FR', options);

            eventItem.innerHTML = `
                <div class="details">
                    <h3>${formattedDate} à ${event.time}</h3>
                    <p>${event.description}</p>
                </div>
                <button class="delete-btn" data-id="${event.id}">Supprimer</button>
            `;

            eventItem.querySelector('.delete-btn').addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                deleteEvent(parseInt(id));
            });

            eventList.appendChild(eventItem);
        }

        /**
         * Supprime un événement en utilisant son ID.
         */
        function deleteEvent(id) {
            let events = getEventsFromLocalStorage();
            events = events.filter(event => event.id !== id);
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            loadEvents();
        }
    } // Fin de la fonction initializeApp()
});
