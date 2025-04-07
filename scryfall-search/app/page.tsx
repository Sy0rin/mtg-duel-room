"use client"

import type React from "react"

import { useState } from "react"
import { TopSearch } from "@/components/top-search"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

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

export default function Home() {
  const [zones, setZones] = useState<Record<string, MagicCard[]>>({
    battlefield: [],
    hand: [],
    graveyard: [],
    exile: [],
  })

  const addCardToZone = (card: MagicCard, zoneName = "hand") => {
    // Check if card already exists in any zone to avoid duplicates
    const cardExists = Object.values(zones).some((zoneCards) => zoneCards.some((c) => c.id === card.id))

    if (!cardExists) {
      setZones((prevZones) => ({
        ...prevZones,
        [zoneName]: [...prevZones[zoneName], card],
      }))
    }
  }

  const removeCardFromZone = (cardId: string, zoneName: string) => {
    setZones((prevZones) => ({
      ...prevZones,
      [zoneName]: prevZones[zoneName].filter((card) => card.id !== cardId),
    }))
  }

  const moveCard = (card: MagicCard, fromZone: string, toZone: string) => {
    console.log(`Moving card ${card.name} from ${fromZone} to ${toZone}`)

    // Create a new zones object to avoid mutation issues
    setZones((prevZones) => {
      const newZones = { ...prevZones }

      // Remove from source zone
      newZones[fromZone] = newZones[fromZone].filter((c) => c.id !== card.id)

      // Add to target zone
      newZones[toZone] = [...newZones[toZone], card]

      return newZones
    })
  }

  const handleCardClick = (card: MagicCard, currentZone: string) => {
    // Implement logic to move card between zones
    // For simplicity, we'll just move cards to the next zone in a cycle
    const zoneOrder = ["hand", "battlefield", "graveyard", "exile"]
    const currentIndex = zoneOrder.indexOf(currentZone)
    const nextZone = zoneOrder[(currentIndex + 1) % zoneOrder.length]
    moveCard(card, currentZone, nextZone)
  }

  // Handle drag and drop between zones
  const handleDragStart = (e: React.DragEvent, card: MagicCard, sourceZone: string) => {
    e.dataTransfer.setData("cardId", card.id)
    e.dataTransfer.setData("sourceZone", sourceZone)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetZone: string) => {
    e.preventDefault()

    const cardId = e.dataTransfer.getData("cardId")
    const sourceZone = e.dataTransfer.getData("sourceZone")

    if (sourceZone === targetZone) return

    // Find the card in the source zone
    const card = zones[sourceZone].find((c) => c.id === cardId)

    if (card) {
      moveCard(card, sourceZone, targetZone)
    }
  }

  // Define the order of zones to display
  const zoneOrder = ["hand", "battlefield", "graveyard", "exile"]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 flex flex-col min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Magic: The Gathering Zones</h1>

        {/* Top search bar */}
        <TopSearch onAddCard={(card, zone) => addCardToZone(card, zone)} />

        {/* Display zones in the specified order */}
        <div className="space-y-6">
          {zoneOrder.map((zoneName) => (
            <div
              key={zoneName}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, zoneName)}
              className="mb-4 p-4 rounded-lg border border-dashed border-transparent hover:border-accent/50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-bold">{zoneName.charAt(0).toUpperCase() + zoneName.slice(1)}</h2>
                <span className="ml-2 text-sm text-muted-foreground">({zones[zoneName].length} cards)</span>
              </div>
              {zones[zoneName].length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {zones[zoneName].map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, zoneName)}
                      onClick={() => handleCardClick(card, zoneName)}
                      className="cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow w-[120px] bg-card rounded-lg p-1"
                    >
                      <img
                        src={getCardImageUrl(card) || "/placeholder.svg"}
                        alt={card.name}
                        className="rounded-lg w-full h-auto"
                        width={120}
                        height={167}
                        onError={(e) => {
                          // Fallback if image fails to load
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=140"
                        }}
                      />
                      <p className="mt-1 text-center text-xs font-medium truncate">{card.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm italic min-h-[100px] flex items-center justify-center">
                  Drop cards here
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Spacer to push the button to the bottom */}
        <div className="flex-grow"></div>

        {/* Clear All Zones button at the bottom */}
        <div className="py-4">
          <Button
            variant="destructive"
            onClick={() => setZones({ battlefield: [], hand: [], graveyard: [], exile: [] })}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Zones
          </Button>
        </div>
      </main>
    </div>
  )
}

// Helper function to get the card image URL
function getCardImageUrl(card: MagicCard): string {
  // Case 1: Card has direct image_uris
  if (card.image_uris?.small) {
    return card.image_uris.small
  }

  // Case 2: Card has card_faces with image_uris (like double-faced cards)
  if (card.card_faces && card.card_faces[0]?.image_uris?.small) {
    return card.card_faces[0].image_uris.small
  }

  // Fallback for cards without images
  return "/placeholder.svg?height=200&width=140"
}

