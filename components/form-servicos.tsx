"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelectSimple } from "@/components/multi-select-simple"
import { DatePickerSimple } from "@/components/date-picker-simple"
import { FileUploader } from "@/components/file-uploader"
import { generatePDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Search, Flag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { estados, estadosBandeiras, getMunicipiosPorEstado } from "@/lib/estados-municipios"

// Alterar as opções de módulos para objetos
const objetosOptions = [
  "Assessoria de Contábil",
  "Assessoria de Recursos Humanos",
  "Assessoria de Patrimonial",
  "Assessoria de Almoxarifado",
  "Assessoria de Controle Interno",
  "Softwares e Sistemas",
  "Outro",
]

// Alterar a lista de técnicos
const tecnicosOptions = ["Manoel Cabral", "João Batista"]

// Alterar o nome do campo no schema
const formSchema = z.object({
  emails: z.string().optional(),
  estado: z.string().optional(),
  municipio: z.string().optional(),
  entidadesOrgaos: z
    .array(
      z.object({
        entidade: z.string(),
        cnpj: z.string(),
      }),
    )
    .optional(),
  objetos: z.array(z.string()).optional(),
  outroObjeto: z.string().optional(),
  servicosRealizados: z.array(z.string()).optional(),
  outroServico: z.string().optional(),
  resumoServicos: z.string().optional(),
  dataServico: z.date().optional(),
  tecnicos: z.array(z.string()).optional(),
  clienteNomeCpf: z
    .array(
      z.object({
        nome: z.string(),
        cpf: z.string(),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function FormServicos() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [anexos, setAnexos] = useState<File[]>([])
  const [clienteTemp, setClienteTemp] = useState({ nome: "", cpf: "" })
  const [entidadeTemp, setEntidadeTemp] = useState({ entidade: "", cnpj: "" })
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<string[]>([])
  const [estadoBusca, setEstadoBusca] = useState("")
  const [municipioBusca, setMunicipioBusca] = useState("")
  const [imagemErros, setImagemErros] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  // Atualizar os valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: "",
      estado: "",
      municipio: "",
      entidadesOrgaos: [],
      objetos: [],
      outroObjeto: "",
      servicosRealizados: [],
      outroServico: "",
      resumoServicos: "",
      tecnicos: [],
      clienteNomeCpf: [],
    },
  })

  // Atualiza os municípios quando o estado muda
  useEffect(() => {
    const estadoSelecionado = form.watch("estado")
    if (estadoSelecionado) {
      const municipios = getMunicipiosPorEstado(estadoSelecionado)
      setMunicipiosDisponiveis(municipios)
      // Limpa o município selecionado quando o estado muda
      form.setValue("municipio", "")
    } else {
      setMunicipiosDisponiveis([])
    }
  }, [form.watch("estado"), form])

  const entidadesOptions = [
    "Prefeitura Municipal",
    "Câmara Municipal",
    "Instituto de Previdência",
    "Secretaria/Fundo de Saúde",
    "Secretaria/Fundo de Educação",
    "Secretaria/Fundo de Assistência Social (Idosos, Criança e Adolescente)",
    "Secretaria/Fundo de Transporte",
    "Secretaria/Fundo de Agricultura e Abastecimento",
    "Secretaria/Fundo de Energia e Iluminação",
    "Secretaria/Fundo de Águas e Esgoto",
    "Consórcio",
    "Governo Estadual (Executivo, Legislativo e Autarquia)",
    "Escritório Contábil/Jurídico",
  ]

  const modulosOptions = [
    "Contabilidade",
    "Controle Interno",
    "Assinatura Digital",
    "Recursos Humanos",
    "Portal do Servidor",
    "Patrimônio",
    "Almoxarifado",
    "Contratos e Convênios",
    "Plano de Contratações Anuais",
    "Licitação e Pregão Gerencial",
    "Frota de Veículos",
    "Protocolo",
    "Processos e Documentos Digitais (Município Digital)",
    "Gerenciador Eletrônico de Documentos",
    "Aplicativo de Business Intelligence",
    "Tributos",
    "Nota Fiscal Eletrônica",
    "Rimob",
    "PagTributos",
    "Portal da Transparência",
    "Outro",
  ]

  const servicosOptions = [
    "Visita Técnica",
    "Treinamento",
    "Reunião",
    "Cadastro de Usuário",
    "Atendimento Remoto",
    "Outro",
  ]

  const handleFileChange = (files: File[]) => {
    setAnexos(files)
  }

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setEntidadeTemp({ ...entidadeTemp, cnpj: formatted })
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClienteTemp({ ...clienteTemp, cpf: formatCPF(e.target.value) })
  }

  const adicionarEntidade = () => {
    if (entidadeTemp.entidade && entidadeTemp.cnpj) {
      const entidadesOrgaos = form.getValues("entidadesOrgaos") || []
      form.setValue("entidadesOrgaos", [...entidadesOrgaos, { ...entidadeTemp }])
      setEntidadeTemp({ entidade: "", cnpj: "" })
    } else {
      toast({
        title: "Erro",
        description: "Selecione a entidade e informe o CNPJ",
        variant: "destructive",
      })
    }
  }

  const removerEntidade = (index: number) => {
    const entidadesOrgaos = form.getValues("entidadesOrgaos") || []
    form.setValue(
      "entidadesOrgaos",
      entidadesOrgaos.filter((_, i) => i !== index),
    )
  }

  const adicionarCliente = () => {
    if (clienteTemp.nome && clienteTemp.cpf) {
      const clientes = form.getValues("clienteNomeCpf") || []
      form.setValue("clienteNomeCpf", [...clientes, { ...clienteTemp }])
      setClienteTemp({ nome: "", cpf: "" })
    } else {
      toast({
        title: "Erro",
        description: "Preencha o nome e CPF do cliente",
        variant: "destructive",
      })
    }
  }

  const removerCliente = (index: number) => {
    const clientes = form.getValues("clienteNomeCpf") || []
    form.setValue(
      "clienteNomeCpf",
      clientes.filter((_, i) => i !== index),
    )
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsGenerating(true)

      // Adicionar um log para debug
      console.log("Gerando relatório com dados:", data)

      const result = await generatePDF({
        tipoRelatorio: "servicos",
        dados: data,
        anexos,
      })

      if (result.success) {
        toast({
          title: "Relatório gerado com sucesso",
          description: result.message || "O relatório foi gerado e está pronto para download",
        })
      } else {
        throw new Error(result.message || "Erro ao gerar o relatório")
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Atualizar o método limparFormulario
  const limparFormulario = () => {
    form.reset({
      emails: "",
      estado: "",
      municipio: "",
      entidadesOrgaos: [],
      objetos: [],
      outroObjeto: "",
      servicosRealizados: [],
      outroServico: "",
      resumoServicos: "",
      dataServico: undefined,
      tecnicos: [],
      clienteNomeCpf: [],
    })
    setAnexos([])
    setClienteTemp({ nome: "", cpf: "" })
    setEntidadeTemp({ entidade: "", cnpj: "" })
    setEstadoBusca("")
    setMunicipioBusca("")
    setMunicipiosDisponiveis([])
    setImagemErros({})
  }

  // Filtrar estados com base na busca
  const estadosFiltrados = estadoBusca
    ? estados.filter((estado) => estado.toLowerCase().includes(estadoBusca.toLowerCase()))
    : estados

  // Filtrar municípios com base na busca
  const municipiosFiltrados = municipioBusca
    ? municipiosDisponiveis.filter((municipio) => municipio.toLowerCase().includes(municipioBusca.toLowerCase()))
    : municipiosDisponiveis

  // Função para renderizar a bandeira ou um ícone de fallback
  const renderizarBandeira = (estado: string) => {
    if (imagemErros[estado]) {
      // Se a imagem falhou, mostrar um ícone de bandeira como fallback
      return <Flag className="h-4 w-4 mr-2 text-gray-500" />
    }

    return (
      <img
        src={estadosBandeiras[estado] || "/placeholder.svg"}
        alt={`Bandeira de ${estado}`}
        className="w-6 h-4 mr-2 object-contain"
        onError={() => {
          console.log(`Erro ao carregar bandeira: ${estadosBandeiras[estado]}`)
          // Marcar esta imagem como com erro para usar o fallback
          setImagemErros((prev) => ({ ...prev, [estado]: true }))
        }}
      />
    )
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <h3 className="text-blue-800 font-medium mb-2">Instruções</h3>
          <p className="text-blue-700 text-sm">
            Preencha os campos do formulário para gerar o relatório técnico de serviços. Você poderá anexar documentos
            relevantes ao final do formulário.
          </p>
        </div>

        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informe seu(s) email(s)</FormLabel>
              <FormControl>
                <Input placeholder="exemplo@email.com, outro@email.com" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Estado e Município</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado">
                          {field.value && (
                            <div className="flex items-center">
                              {renderizarBandeira(field.value)}
                              {field.value}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Buscar estado..."
                          className="h-8 w-full"
                          value={estadoBusca}
                          onChange={(e) => setEstadoBusca(e.target.value)}
                        />
                      </div>
                      {estadosFiltrados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          <div className="flex items-center">
                            {renderizarBandeira(estado)}
                            {estado}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="municipio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Município</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!form.watch("estado")}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o município" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="flex items-center px-3 pb-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                          placeholder="Buscar município..."
                          className="h-8 w-full"
                          value={municipioBusca}
                          onChange={(e) => setMunicipioBusca(e.target.value)}
                        />
                      </div>
                      {municipiosFiltrados.map((municipio) => (
                        <SelectItem key={municipio} value={municipio}>
                          {municipio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Entidade(s) e CNPJ(s)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Select
                value={entidadeTemp.entidade}
                onValueChange={(value) => setEntidadeTemp({ ...entidadeTemp, entidade: value })}
                disabled={!form.watch("municipio")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a entidade" />
                </SelectTrigger>
                <SelectContent>
                  {entidadesOptions.map((entidade) => (
                    <SelectItem key={entidade} value={entidade}>
                      {entidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Input
                placeholder="00.000.000/0000-00"
                value={entidadeTemp.cnpj}
                onChange={handleCNPJChange}
                maxLength={18}
                disabled={!form.watch("municipio")}
              />
            </div>
            <div className="md:col-span-1">
              <Button type="button" onClick={adicionarEntidade} className="w-full" disabled={!form.watch("municipio")}>
                Adicionar Órgão
              </Button>
            </div>
          </div>

          {form.watch("entidadesOrgaos")?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Entidades adicionadas:</h3>
                <ul className="space-y-2">
                  {form.watch("entidadesOrgaos").map((item, index) => (
                    <li key={index} className="flex justify-between items-center border-b pb-2">
                      <span>
                        {item.entidade} - {item.cnpj}
                      </span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removerEntidade(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Detalhes do Serviço</h3>

          {/* Alterar o campo de módulos para objetos */}
          <FormField
            control={form.control}
            name="objetos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objeto(s)</FormLabel>
                <FormControl>
                  <MultiSelectSimple
                    options={objetosOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione os objetos"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Alterar o campo de outro módulo para outro objeto */}
          {form.watch("objetos")?.includes("Outro") && (
            <FormField
              control={form.control}
              name="outroObjeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique outro objeto</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o objeto" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          )}

          {/* Campo de serviços realizados */}
          <FormField
            control={form.control}
            name="servicosRealizados"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço(s) Realizado(s)</FormLabel>
                <FormControl>
                  <MultiSelectSimple
                    options={servicosOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione os serviços"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo de outro serviço */}
          {form.watch("servicosRealizados")?.includes("Outro") && (
            <FormField
              control={form.control}
              name="outroServico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique outro serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva o serviço" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Resumo e Data</h3>

          {/* Campo de resumo de serviços */}
          <FormField
            control={form.control}
            name="resumoServicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo do(s) Serviço(s) Realizado(s)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva detalhadamente os serviços realizados"
                    className="min-h-[150px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo de data do serviço */}
          <FormField
            control={form.control}
            name="dataServico"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Prestação do Serviço</FormLabel>
                <DatePickerSimple date={field.value} setDate={field.onChange} />
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Técnicos</h3>

          {/* Campo de técnicos especializados */}
          <FormField
            control={form.control}
            name="tecnicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Técnico(s) Especializado(s)</FormLabel>
                <FormControl>
                  <MultiSelectSimple
                    options={tecnicosOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione os técnicos"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo de técnicos do cliente */}
          <div className="space-y-4">
            <Label>Nome e CPF do(s) Técnico(s)/Gestor(es) do Cliente</Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="md:col-span-1">
                <Input
                  placeholder="Nome"
                  value={clienteTemp.nome}
                  onChange={(e) => setClienteTemp({ ...clienteTemp, nome: e.target.value })}
                />
              </div>
              <div className="md:col-span-1">
                <Input placeholder="CPF" value={clienteTemp.cpf} onChange={handleCPFChange} maxLength={14} />
              </div>
              <div className="md:col-span-1">
                <Button type="button" onClick={adicionarCliente} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de clientes adicionados */}
            {form.watch("clienteNomeCpf")?.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Técnicos/Gestores do Cliente adicionados:</h3>
                  <ul className="space-y-2">
                    {form.watch("clienteNomeCpf").map((cliente, index) => (
                      <li key={index} className="flex justify-between items-center border-b pb-2">
                        <span>
                          {cliente.nome} - {cliente.cpf}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removerCliente(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <h3 className="text-lg font-medium text-gray-800">Anexos</h3>

          <div>
            <Label>Anexar Documento(s)</Label>
            <FileUploader onChange={handleFileChange} value={anexos} />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                Limpar Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar formulário?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá limpar todos os dados preenchidos no formulário. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={limparFormulario}>Limpar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="submit" disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando relatório...
              </>
            ) : (
              "Gerar Relatório"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
