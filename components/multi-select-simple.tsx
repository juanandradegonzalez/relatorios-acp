"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export type OptionType = {
  label: string
  value: string
}

interface MultiSelectSimpleProps {
  options: OptionType[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelectSimple({
  options,
  selected = [],
  onChange,
  placeholder = "Selecione opções...",
  className,
}: MultiSelectSimpleProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Filtrar opções com base no termo de busca
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleToggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  // Fechar o dropdown quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Função para exibir os itens selecionados
  const displaySelectedItems = () => {
    if (!selected || selected.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    // Se houver muitos itens selecionados, mostrar apenas alguns e indicar quantos mais
    if (selected.length > 3) {
      const visibleItems = selected.slice(0, 3)
      const remainingCount = selected.length - 3

      return (
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {visibleItems.map((value) => {
            const option = options.find((opt) => opt.value === value)
            return (
              <Badge key={value} variant="secondary" className="mr-1">
                {option?.label || value}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          <Badge variant="outline">+{remainingCount} mais</Badge>
        </div>
      )
    }

    // Se houver poucos itens, mostrar todos
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((value) => {
          const option = options.find((opt) => opt.value === value)
          return (
            <Badge key={value} variant="secondary" className="mr-1">
              {option?.label || value}
              <button
                type="button"
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(value)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="outline"
        type="button"
        className={cn("w-full justify-between h-auto min-h-10 text-left", className)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <div className="flex flex-wrap gap-1 overflow-hidden">{displaySelectedItems()}</div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="mb-2"
            />
          </div>

          <div className="max-h-60 overflow-auto p-2">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-500">Nenhuma opção encontrada</div>
            ) : (
              filteredOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`option-${option.value}`}
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => handleToggleOption(option.value)}
                  />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className="flex-grow cursor-pointer"
                    onClick={() => handleToggleOption(option.value)}
                  >
                    {option.label}
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
