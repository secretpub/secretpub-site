import { permanentRedirect } from "next/navigation";

// La boutique en ligne est ouverte (11/11/2026) : l'ancienne page « catalogue bientôt disponible »
// renvoie vers elle, pour les anciens liens et les favoris.
export default function CataloguePage() {
  permanentRedirect("https://boutique.secretpub.fr");
}
