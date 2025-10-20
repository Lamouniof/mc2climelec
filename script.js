// Mot de passe : 250273
const CORRECT_PASSWORD = "250273";
// Nom de la collection dans Firestore
const COLLECTION_NAME = "appointments"; 

// La variable 'db' est déjà initialisée dans index.html

// --- Gestion de la Connexion ---

function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-message');
    
    if (input === CORRECT_PASSWORD) {
        // Succès : stocke l'état pour les rechargements futurs
        sessionStorage.setItem('isAuthenticated', 'true');
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        errorMsg.textContent = "";
        
        // DÉCLENCHE L'ÉCOUTEUR EN TEMPS RÉEL
        setupRealtimeListener(); 
    } else {
        errorMsg.textContent = "Mot de passe incorrect.";
    }
}

// Vérifie l'état de connexion au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Note : On utilise sessionStorage ici pour obliger la reconnexion à chaque fermeture de l'onglet
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
        setupRealtimeListener();
    }
});


// ------------------------------------------------------------------
// --- GESTION DES RENDEZ-VOUS EN TEMPS RÉEL AVEC CLOUD FIRESTORE ---
// ------------------------------------------------------------------

/**
 * Configure un écouteur en temps réel sur la collection Firestore.
 * C'EST CECI QUI GARANTIT LE "TEMPS RÉEL" ET LA PERSISTANCE.
 */
function setupRealtimeListener() {
    // Trie les rendez-vous par date/heure
    db.collection(COLLECTION_NAME).orderBy("dateTime", "asc").onSnapshot(snapshot => {
        const appointments = [];
        
        // Pour chaque document reçu (ou modifié)
        snapshot.forEach(doc => {
            const data = doc.data();
            appointments.push({
                id: doc.id, // ID unique Firestore
                dateTime: data.dateTime,
                description: data.description
            });
        });

        // Met à jour l'interface avec les données fraîches
        renderAppointments(appointments);
        
        console.log("Mise à jour en temps réel effectuée.");
    }, error => {
        console.error("Erreur lors de la récupération en temps réel : ", error);
        document.getElementById('appointments-list').innerHTML = '<p style="color:red; text-align: center; padding: 20px;">Erreur de connexion à la base de données.</p>';
    });
}


// Fonction pour afficher les rendez-vous dans l'interface (aucune modification)
function renderAppointments(appointments) {
    const list = document.getElementById('appointments-list');
    list.innerHTML = ''; 

    if (appointments.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 20px;">Aucun rendez-vous planifié.</p>';
        return;
    }

    appointments.forEach(app => {
        const item = document.createElement('div');
        item.classList.add('appointment-item');
        
        // Utilisation des objets Date JavaScript
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

/**
 * Ajoute un nouveau rendez-vous à la base de données Firestore.
 */
function addAppointment() {
    const dateInput = document.getElementById('date-input').value;
    const timeInput = document.getElementById('time-input').value;
    const descriptionInput = document.getElementById('description-input').value;

    if (!dateInput || !timeInput || !descriptionInput) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    // Création du nouvel objet à stocker dans Firestore
    const newAppointment = {
        dateTime: new Date(`${dateInput}T${timeInput}:00`).toISOString(), // Format ISO pour le tri
        description: descriptionInput
    };
    
    // Écriture des données dans Firestore
    db.collection(COLLECTION_NAME).add(newAppointment)
        .then(() => {
            console.log("Rendez-vous ajouté avec succès à Firestore.");
            // L'écouteur (onSnapshot) s'occupera de rafraîchir l'interface automatiquement !
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout du rendez-vous : ", error);
            alert("Erreur lors de l'enregistrement du rendez-vous.");
        });

    // Réinitialisation de la modale et fermeture
    document.getElementById('date-input').value = '';
    document.getElementById('time-input').value = '';
    document.getElementById('description-input').value = '';
    document.getElementById('add-modal').classList.add('hidden');
}
