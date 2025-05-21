"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onChange: (files: File[]) => void
  value: File[]
  className?: string
  maxFiles?: number
  maxSize?: number // em bytes
  accept?: Record<string, string[]>
}

export function FileUploader({
  onChange,
  value = [],
  className,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB por padrão
  accept = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  },
}: FileUploaderProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      // Verificar se não excede o número máximo de arquivos
      if (value.length + acceptedFiles.length > maxFiles) {
        alert(`Você pode enviar no máximo ${maxFiles} arquivos.`)
        return
      }

      // Adicionar os novos arquivos aos existentes
      onChange([...value, ...acceptedFiles])
    },
    [onChange, value, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
  })

  const removeFile = (index: number) => {
    const newFiles = [...value]
    newFiles.splice(index, 1)
    onChange(newFiles)
  }

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} bytes`
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
    else return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary hover:bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">
            {isDragActive ? "Solte os arquivos aqui..." : "Arraste e solte arquivos aqui, ou clique para selecionar"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Suporta PDF, imagens e documentos (máx. {maxFiles} arquivos, {formatFileSize(maxSize)} cada)
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Arquivos anexados ({value.length}/{maxFiles}):
          </p>
          <ul className="space-y-2">
            {value.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
