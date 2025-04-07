"use client"

import { useState } from "react"
import { SearchBar } from "./search-bar"
import { CardDisplay } from "./card-display"
import { Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar"
import type { MagicCard } from "./zone"

interface SearchSidebarProps {
  onAddCard: (card: MagicCard, zone: string) => void
}

export function SearchSidebar({ onAddCard }: SearchSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <>
      <Sidebar>
        <SidebarContent className="w-80 bg-background p-4 border-r h-screen">
          <h2 className="text-2xl font-bold mb-4">Card Search</h2>
          <SearchBar onSearch={handleSearch} />
          <CardDisplay searchQuery={searchQuery} onAddCard={onAddCard} />
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="fixed top-4 left-4 z-50" />
    </>
  )
}

