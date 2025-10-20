// Mot de passe : 250273
const CORRECT_PASSWORD = "250273";
const STORAGE_KEY = 'appointmentsData';

// --- Gestion de la Connexion ---

function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-message');
    
    if (input === CORRECT_PASSWORD) {
        // Succès
        localStorage.setItem('isAuthenticated', 'true');
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        errorMsg.textContent = "";
        loadAppointments();
    } else {
        // Échec
        errorMsg.textContent = "Mot de passe incorrect.";
    }
}

// Vérifie si l'utilisateur est déjà connecté (si la page est rechargée)
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        loadAppointments();
    }
    // Simulation du "temps réel" via le polling toutes les 5 secondes
    setInterval(loadAppointments, 5000); 
});

// --- Gestion des Rendez-vous ---

// Fonction pour récupérer les données (simule la lecture du JSON)
function getAppointments() {
    const data = localStorage.getItem(STORAGE_KEY);
    // Tente de récupérer les données du stockage local, sinon retourne un tableau vide.
    return data ? JSON.parse(data) : [];
}

// Fonction pour sauvegarder les données (simule l'écriture dans le JSON)
function saveAppointments(appointments) {
    // Note : Cette fonction sauvegarde DANS le navigateur (localStorage), 
    // elle ne peut PAS modifier le fichier data.json sur GitHub.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    renderAppointments(appointments);
}

// Fonction pour charger et afficher les rendez-vous
function loadAppointments() {
    // Dans un vrai scénario, on ferait un `fetch('/data.json')` ici.
    // Pour la démo, on utilise le stockage local.
    const appointments = getAppointments();
    renderAppointments(appointments);
}

// Fonction pour afficher les rendez-vous dans l'interface
function renderAppointments(appointments) {
    const list = document.getElementById('appointments-list');
    list.innerHTML = ''; // Vide la liste

    // Triage par date et heure
    const sortedAppointments = appointments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    if (sortedAppointments.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 20px;">Aucun rendez-vous planifié.</p>';
        return;
    }

    sortedAppointments.forEach(app => {
        const item = document.createElement('div');
        item.classList.add('appointment-item');
        
        const dateObj = new Date(app.dateTime);
        const dateStr = dateObj.toLocaleDateString('fr-FR');
        const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <h4>📅 ${dateStr} à ${timeStr}</h4>
            <p>${app.description}</p>
        `;
        list.appendChild(item);
    });
}

// Fonction pour ajouter un nouveau rendez-vous
function addAppointment() {
    const dateInput = document.getElementById('date-input').value;
    const timeInput = document.getElementById('time-input').value;
    const descriptionInput = document.getElementById('description-input').value;

    if (!dateInput || !timeInput || !descriptionInput) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    const newAppointment = {
        id: Date.now(), // ID unique simple
        dateTime: `${dateInput}T${timeInput}:00`,
        description: descriptionInput
    };

    const appointments = getAppointments();
    appointments.push(newAppointment);

    // Sauvegarde et mise à jour de l'affichage
    saveAppointments(appointments); 

    // Réinitialisation de la modale et fermeture
    document.getElementById('date-input').value = '';
    document.getElementById('time-input').value = '';
    document.getElementById('description-input').value = '';
    document.getElementById('add-modal').classList.add('hidden');
}
