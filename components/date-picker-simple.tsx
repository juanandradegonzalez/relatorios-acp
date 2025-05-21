"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DatePickerSimpleProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function DatePickerSimple({ date, setDate, className }: DatePickerSimpleProps) {
  const [inputValue, setInputValue] = React.useState(date ? format(date, "dd/MM/yyyy") : "")
  const [isValid, setIsValid] = React.useState(true)

  // Atualizar o input quando a data mudar externamente
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Validar e converter a data
    if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      try {
        const parsedDate = parse(value, "dd/MM/yyyy", new Date())
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate)
          setIsValid(true)
          return
        }
      } catch (error) {
        // Erro ao analisar a data
      }
    }

    // Se chegou aqui, a data é inválida ou incompleta
    if (value === "") {
      setDate(undefined)
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }

  // Formatar automaticamente a data enquanto o usuário digita
  const formatDateInput = (input: string): string => {
    // Remover caracteres não numéricos
    const numbers = input.replace(/\D/g, "")

    // Aplicar a máscara dd/mm/yyyy
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir a submissão do formulário ao pressionar Enter
    if (e.key === "Enter") {
      e.preventDefault()
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder="DD/MM/AAAA"
          value={inputValue}
          onChange={(e) => {
            const formatted = formatDateInput(e.target.value)
            setInputValue(formatted)
            handleInputChange({
              ...e,
              target: { ...e.target, value: formatted },
            } as React.ChangeEvent<HTMLInputElement>)
          }}
          onKeyDown={handleKeyDown}
          className={cn("pl-10", !isValid && "border-red-500 focus:border-red-500")}
          maxLength={10}
        />
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {!isValid && <p className="text-red-500 text-xs mt-1">Por favor, insira uma data válida no formato DD/MM/AAAA</p>}
    </div>
  )
}
