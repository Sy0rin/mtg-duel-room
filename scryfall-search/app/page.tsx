"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TopSearch } from "@/components/top-search"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, Copy, X } from "lucide-react"

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
  counters?: number
  copyCount?: number
  isToken?: boolean
  type_line?: string
}

export default function Home() {
  const [zones, setZones] = useState<Record<string, MagicCard[]>>({
    battlefield: [],
    hand: [],
    graveyard: [],
    exile: [],
  })
  const [previewCard, setPreviewCard] = useState<MagicCard | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    card: MagicCard | null
    zone: string | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    card: null,
    zone: null,
  })

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu((prev) => ({ ...prev, visible: false }))
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const addCardToZone = (card: MagicCard, zoneName = "hand") => {
    // Check if card already exists in any zone to avoid duplicates
    const cardExists = Object.values(zones).some((zoneCards) => zoneCards.some((c) => c.id === card.id))

    if (!cardExists) {
      // Check if the card is a token
      const isToken = card.name.toLowerCase().includes("token") || card.type_line?.toLowerCase().includes("token")

      setZones((prevZones) => ({
        ...prevZones,
        [zoneName]: [...prevZones[zoneName], { ...card, counters: 0, copyCount: 1, isToken }],
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

  // Handle card preview
  const handleCardClick = (card: MagicCard) => {
    setPreviewCard(card)
  }

  // Handle right-click context menu
  const handleCardRightClick = (e: React.MouseEvent, card: MagicCard, zoneName: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      card,
      zone: zoneName,
    })
  }

  // Handle adding a counter to a card
  const handleAddCounter = () => {
    if (!contextMenu.card || !contextMenu.zone) return

    setZones((prevZones) => {
      const newZones = { ...prevZones }
      newZones[contextMenu.zone!] = newZones[contextMenu.zone!].map((c) => {
        if (c.id === contextMenu.card!.id) {
          return { ...c, counters: (c.counters || 0) + 1 }
        }
        return c
      })
      return newZones
    })

    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // Handle removing a counter from a card
  const handleRemoveCounter = () => {
    if (!contextMenu.card || !contextMenu.zone) return

    setZones((prevZones) => {
      const newZones = { ...prevZones }
      newZones[contextMenu.zone!] = newZones[contextMenu.zone!].map((c) => {
        if (c.id === contextMenu.card!.id && (c.counters || 0) > 0) {
          return { ...c, counters: (c.counters || 0) - 1 }
        }
        return c
      })
      return newZones
    })

    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // Handle creating a copy of a card
  const handleCreateCopy = () => {
    if (!contextMenu.card || !contextMenu.zone) return

    setZones((prevZones) => {
      const newZones = { ...prevZones }
      newZones[contextMenu.zone!] = newZones[contextMenu.zone!].map((c) => {
        if (c.id === contextMenu.card!.id) {
          return { ...c, copyCount: (c.copyCount || 1) + 1 }
        }
        return c
      })
      return newZones
    })

    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  // Handle removing a card from a zone
  const handleRemoveCard = () => {
    if (!contextMenu.card || !contextMenu.zone) return

    setZones((prevZones) => {
      const newZones = { ...prevZones }

      // If it's a card with copies, decrement the copy count
      if ((contextMenu.card!.copyCount || 1) > 1) {
        newZones[contextMenu.zone!] = newZones[contextMenu.zone!].map((c) => {
          if (c.id === contextMenu.card!.id) {
            return { ...c, copyCount: (c.copyCount || 1) - 1 }
          }
          return c
        })
      } else {
        // Otherwise, remove the card completely
        newZones[contextMenu.zone!] = newZones[contextMenu.zone!].filter((c) => c.id !== contextMenu.card!.id)
      }

      return newZones
    })

    setContextMenu((prev) => ({ ...prev, visible: false }))
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
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {zones[zoneName].map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card, zoneName)}
                      onClick={() => handleCardClick(card)}
                      onContextMenu={(e) => handleCardRightClick(e, card, zoneName)}
                      className={`cursor-pointer hover:shadow-lg transition-shadow bg-card rounded-lg p-1 w-[80px] mx-auto relative ${
                        (card.copyCount || 1) > 1 && !card.isToken ? "ring-2 ring-green-500" : ""
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={getCardImageUrl(card) || "/placeholder.svg"}
                          alt={card.name}
                          className={`rounded-lg w-full h-auto ${(card.copyCount || 1) > 1 && !card.isToken ? "opacity-90" : ""}`}
                          onError={(e) => {
                            // Fallback if image fails to load
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=140"
                          }}
                        />
                        {(card.copyCount || 1) > 1 && !card.isToken && (
                          <div className="absolute inset-0 bg-green-500 opacity-20 rounded-lg pointer-events-none"></div>
                        )}
                        {(card.counters || 0) > 0 && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {card.counters}
                          </div>
                        )}
                        {(card.copyCount || 1) > 1 && (
                          <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {card.copyCount}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-center text-[10px] font-medium truncate">{card.name}</p>
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

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="fixed bg-card shadow-lg rounded-lg overflow-hidden z-50 border"
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                onClick={handleAddCounter}
              >
                <Plus className="h-4 w-4" /> Add Counter
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                onClick={handleRemoveCounter}
                disabled={(contextMenu.card?.counters || 0) <= 0}
              >
                <Minus className="h-4 w-4" /> Remove Counter
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                onClick={handleCreateCopy}
              >
                <Copy className="h-4 w-4" /> Create Copy
              </button>
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm text-red-500"
                onClick={handleRemoveCard}
              >
                <X className="h-4 w-4" /> Remove Card
              </button>
            </div>
          </div>
        )}

        {/* Card preview modal */}
        {previewCard && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPreviewCard(null)}
          >
            <div
              className="bg-card p-4 rounded-lg shadow-lg max-w-[90vw] max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
            >
              <div className="relative">
                <img
                  src={
                    previewCard.image_uris?.normal ||
                    previewCard.card_faces?.[0]?.image_uris?.normal ||
                    "/placeholder.svg" ||
                    "/placeholder.svg" ||
                    "/placeholder.svg"
                  }
                  alt={previewCard.name}
                  className="rounded max-h-[80vh]"
                />
                {(previewCard.copyCount || 1) > 1 && !previewCard.isToken && (
                  <div className="absolute inset-0 bg-green-500 opacity-20 rounded pointer-events-none"></div>
                )}
              </div>
              <div className="text-center mt-2">
                <p className="font-semibold">{previewCard.name}</p>
                <div className="flex justify-center gap-4 mt-1">
                  {(previewCard.counters || 0) > 0 && (
                    <p className="text-sm text-blue-400">Counters: {previewCard.counters}</p>
                  )}
                  {(previewCard.copyCount || 1) > 1 && (
                    <p className="text-sm text-green-400">Copies: {previewCard.copyCount}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
