"use client"

import { useState } from "react"
import { SearchBar } from "./search-bar"
import { CardDisplay } from "./card-display"
import type { MagicCard } from "./zone"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TopSearchProps {
  onAddCard: (card: MagicCard, zone: string) => void
}

export function TopSearch({ onAddCard }: TopSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsExpanded(true)
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2">
        <div className="flex-grow">
          <SearchBar onSearch={handleSearch} />
        </div>
        {isExpanded && (
          <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isExpanded && searchQuery && (
        <div className="mt-2 p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              Close
            </Button>
          </div>
          <CardDisplay
            searchQuery={searchQuery}
            onAddCard={(card, zone) => {
              onAddCard(card, zone)
              // Optionally close the search results after adding a card
              // setIsExpanded(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

