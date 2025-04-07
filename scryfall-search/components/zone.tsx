export interface MagicCard {
  id: string
  name: string
  image_uris?: {
    small: string
    normal?: string
  }
  card_faces?: Array<{
    image_uris: {
      small: string
      normal?: string
    }
  }>
}

interface ZoneProps {
  name: string
  cards: MagicCard[]
  onCardClick: (card: MagicCard) => void
  id: string
}

export function Zone({ name, cards, onCardClick, id }: ZoneProps) {
  // This component is no longer used in the new implementation
  return null
}

