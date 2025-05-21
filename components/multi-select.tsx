"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export type OptionType = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: OptionType[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Selecione opções...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  // Função para exibir os itens selecionados de forma otimizada
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)}
          type="button" // Explicitamente definir como button para evitar submissão
          onClick={(e) => {
            e.preventDefault() // Prevenir comportamento padrão
            setOpen(!open) // Alternar estado do popover manualmente
          }}
        >
          <div className="flex flex-wrap gap-1 overflow-hidden">{displaySelectedItems()}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar opção..." />
          <CommandList>
            <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const isSelected = selected?.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      let newSelected = [...(selected || [])]
                      if (isSelected) {
                        newSelected = newSelected.filter((item) => item !== option.value)
                      } else {
                        newSelected.push(option.value)
                      }
                      onChange(newSelected)
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-sm border h-4 w-4",
                          isSelected ? "bg-primary border-primary" : "border-input",
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
