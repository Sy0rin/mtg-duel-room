"use client"

import type React from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MagicCard } from "./zone"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle } from "lucide-react"

interface CardDisplayProps {
  searchQuery: string
  onAddCard: (card: MagicCard, zone: string) => void
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function CardDisplay({ searchQuery, onAddCard }: CardDisplayProps) {
  // Add support for token search
  const formattedQuery =
    searchQuery.includes("token") && !searchQuery.includes("is:token") ? `${searchQuery} is:token` : searchQuery

  const { data, error, isLoading } = useSWR<{ data?: MagicCard[]; object?: string; details?: string }>(
    formattedQuery ? `https://api.scryfall.com/cards/search?q=${encodeURIComponent(formattedQuery)}` : null,
    fetcher,
  )

  const handleDoubleClick = (card: MagicCard) => {
    onAddCard(card, "hand")
  }

  const handleRightClick = (e: React.MouseEvent, card: MagicCard) => {
    e.preventDefault()
    // Right-click is handled by the DropdownMenu
  }

  // Helper function to get the card image URL
  const getCardImageUrl = (card: MagicCard): string => {
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

  if (error)
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Error loading cards: {error.message}</span>
      </div>
    )

  if (isLoading) return <CardSkeleton />

  // Handle API error responses
  if (data?.object === "error") {
    return (
      <div className="text-yellow-500 p-4 border border-yellow-300 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>{data.details || "No results found"}</span>
      </div>
    )
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-muted-foreground p-4 border rounded-lg">
        No cards found. Try a different search term or check your syntax.
        {searchQuery.includes("token") && (
          <p className="mt-2 text-sm">
            Tip: To search for tokens, use "is:token" in your query (e.g., "goblin is:token").
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {data.data.map((card) => (
        <Card
          key={card.id}
          className="overflow-hidden cursor-pointer"
          onDoubleClick={() => handleDoubleClick(card)}
          onContextMenu={(e) => handleRightClick(e, card)}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CardContent className="p-2">
                <img
                  src={getCardImageUrl(card) || "/placeholder.svg"}
                  alt={card.name}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    // Fallback if image fails to load
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=140"
                  }}
                />
                <h2 className="mt-2 text-center font-semibold text-sm">{card.name}</h2>
              </CardContent>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAddCard(card, "hand")}>Add to Hand</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddCard(card, "battlefield")}>Add to Battlefield</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddCard(card, "graveyard")}>Add to Graveyard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddCard(card, "exile")}>Add to Exile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-2">
            <Skeleton className="w-full h-40 rounded-lg" />
            <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

