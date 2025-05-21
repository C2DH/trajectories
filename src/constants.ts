import { Place } from './types'

export const ColorByPlaceType: Record<string, string> = {
  Home: '#009673',
  'Groupe de soutien': '#067BC2',
  Crèche: '#84DD63',
  Sanatorium: '#684756',
  'Atelier protégé': '#FB4D3D',
  "Maison d'accueil": '#5ABCB9',
  'Hôpital général (département)': '#9D9171',
  'Hôpital psychiatrique': '#FF3366',
  'Institut médico-pédagogique': '#26532B',
  'Centre psychiatrique extra-hospitalier': '#D56062',
  'Service social': '#3D314A',
  'Centre de revalidation': '#5998C5', // medical/rehab - teal-blue
  'Ecole spécialisé': '#A8E55C', // child-related - similar to Crèche
  'Hôpital général': '#BFAE8E', // similar to 'Hôpital général (département)'
  'Annexe psychiatrique de Prison': '#B03A48', // psychiatric + penal tone
  Prison: '#2F2F2F', // dark gray-black for penal
  Colonie: '#AD7B5C', // earthy tone (institutional)
  Orphelinat: '#A3D977', // child-related - match Crèche/Ecole spécialisé
  'Hospice pour enfants': '#95D16F', // child-related
  'Dépôt de mendicité': '#7C6F5A', // dark muted tone
  'Etablissement de défense sociale': '#5E3A39', // prison/psy focus
  'établissements d’observation': '#B7DD8C', // youth-focused, like Crèche
  Couvent: '#6A5A99', // religious - soft purple
  'Centre médico-chirurgical': '#4FA1C2', // medical - blue
  'Centre gériatrique': '#D3B88C', // elderly care - muted beige
  'Maisons de soins psychiatriques': '#E2727E', // psychiatric tone
  'Maison de refuge': '#4C6773', // social/safe housing
  Polyclinique: '#5CBCD4', // medical - light blue
  'Organisme de tutelle': '#4D4069', // administrative - dark neutral
  'Maison de retraite': '#D8C3A5', // elderly care - soft beige
  'Camp de concentration': '#1C1C1C', // black - dark historical tone
  Médecin: '#3C9DC6', // medical - blue
  'Médecin traitant': '#3C9DC6',
  'Hôpital psychiatrique (département)': '#E04C6A', // psychiatric variation
  psychiatre: '#D7435F',
  "Medecin-directeur de l'EDS de Tournai": '#3798A6', // medical admin
  'Assistante sociale': '#4A3A5E', // like 'Service social'
  'Médecin généraliste': '#56A3B5', // general medical tone
}

export function getColorByPlace(place: Place) {
  const color = ColorByPlaceType[place.type.trim()]
  if (!color) {
    console.warn(
      `Color not found for place type: "${place.type.trim()}"`,
      place
    )
  }
  return color ? color : '#000000' // default to black if type not found
}
