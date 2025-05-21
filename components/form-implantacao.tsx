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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2, Search, Flag } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { estados, estadosBandeiras, getMunicipiosPorEstado } from "@/lib/estados-municipios"

const etapaSchema = z.object({
  nome: z.string(),
  situacao: z.string(),
  inicio: z.date(),
  fim: z.date(),
})

const solucaoSchema = z.object({
  data: z.date(),
  descricao: z.string(),
})

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
  etapas: z.array(etapaSchema).optional(),
  situacoesCriticas: z.array(z.string()).optional(),
  outraSituacaoCritica: z.string().optional(),
  solucoes: z.array(solucaoSchema).optional(),
  detalhamentoAdicional: z.string().optional(),
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

export function FormImplantacao() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [anexos, setAnexos] = useState<File[]>([])
  const [clienteTemp, setClienteTemp] = useState({ nome: "", cpf: "" })
  const [etapaTemp, setEtapaTemp] = useState<{
    nome: string
    situacao: string
    inicio: Date | undefined
    fim: Date | undefined
  }>({
    nome: "",
    situacao: "",
    inicio: undefined,
    fim: undefined,
  })
  const [solucaoTemp, setSolucaoTemp] = useState<{
    data: Date | undefined
    descricao: string
  }>({
    data: undefined,
    descricao: "",
  })
  const [entidadeTemp, setEntidadeTemp] = useState({ entidade: "", cnpj: "" })
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<string[]>([])
  const [estadoBusca, setEstadoBusca] = useState("")
  const [municipioBusca, setMunicipioBusca] = useState("")
  const [imagemErros, setImagemErros] = useState<Record<string, boolean>>({})
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: "",
      estado: "",
      municipio: "",
      entidadesOrgaos: [],
      objetos: [],
      outroObjeto: "",
      etapas: [],
      situacoesCriticas: [],
      outraSituacaoCritica: "",
      solucoes: [],
      detalhamentoAdicional: "",
      dataServico: undefined,
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

  const objetosOptions = [
    "Assessoria de Contábil",
    "Assessoria de Recursos Humanos",
    "Assessoria de Patrimonial",
    "Assessoria de Almoxarifado",
    "Assessoria de Controle Interno",
    "Softwares e Sistemas",
    "Outro",
  ]

  const etapasOptions = [
    "Solicitação do Banco de Dados e/ou Informações do Município",
    "Estudo dos Dados e Informações",
    "Higienização dos Dados e Informações",
    "Criação de Novo Banco de Dados/Informações para o Município",
    "Reformulação dos Dados Trabalhados",
    "Entrega dos Materiais Trabalhados e Serviços Realizados",
  ]

  const situacoesEtapaOptions = [
    "Não Iniciado",
    "Em Planejamento",
    "Em Execução",
    "Pausado",
    "Cancelado",
    "Finalizado",
    "Homologado",
  ]

  const situacoesCriticasOptions = [
    "Nenhuma informação/banco repassado.",
    "Informações insuficientes para realização dos trabalhos.",
    "Informações com difíceis entendimentos (faltando dados, dados reduzidos).",
    "Falta de uso dos serviços por parte dos funcionários do órgão.",
    "Problemas entre relatórios e o que encontramos nos locais físicos.",
    "Outro",
  ]

  const tecnicosOptions = ["Manoel Cabral", "João Batista"]

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

  const adicionarEtapa = () => {
    if (etapaTemp.nome && etapaTemp.situacao && etapaTemp.inicio && etapaTemp.fim) {
      const etapas = form.getValues("etapas") || []
      form.setValue("etapas", [...etapas, { ...etapaTemp }])
      setEtapaTemp({
        nome: "",
        situacao: "",
        inicio: undefined,
        fim: undefined,
      })
    } else {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da etapa",
        variant: "destructive",
      })
    }
  }

  const removerEtapa = (index: number) => {
    const etapas = form.getValues("etapas") || []
    form.setValue(
      "etapas",
      etapas.filter((_, i) => i !== index),
    )
  }

  const adicionarSolucao = () => {
    if (solucaoTemp.data && solucaoTemp.descricao) {
      const solucoes = form.getValues("solucoes") || []
      form.setValue("solucoes", [...solucoes, { ...solucaoTemp }])
      setSolucaoTemp({
        data: undefined,
        descricao: "",
      })
    } else {
      toast({
        title: "Erro",
        description: "Preencha a data e descrição da solução",
        variant: "destructive",
      })
    }
  }

  const removerSolucao = (index: number) => {
    const solucoes = form.getValues("solucoes") || []
    form.setValue(
      "solucoes",
      solucoes.filter((_, i) => i !== index),
    )
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsGenerating(true)

      // Adicionar um log para debug
      console.log("Gerando relatório de implantação com dados:", data)

      const result = await generatePDF({
        tipoRelatorio: "migracao", // Mantemos o mesmo tipo para compatibilidade com o backend
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

  const limparFormulario = () => {
    form.reset({
      emails: "",
      estado: "",
      municipio: "",
      entidadesOrgaos: [],
      objetos: [],
      outroObjeto: "",
      etapas: [],
      situacoesCriticas: [],
      outraSituacaoCritica: "",
      solucoes: [],
      detalhamentoAdicional: "",
      dataServico: undefined,
      tecnicos: [],
      clienteNomeCpf: [],
    })
    setAnexos([])
    setClienteTemp({ nome: "", cpf: "" })
    setEtapaTemp({
      nome: "",
      situacao: "",
      inicio: undefined,
      fim: undefined,
    })
    setSolucaoTemp({
      data: undefined,
      descricao: "",
    })
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
            Preencha os campos do formulário para gerar o relatório técnico de implantação. Você poderá anexar
            documentos relevantes ao final do formulário.
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

        <div className="space-y-4">
          <Label>Etapa(s) da(s) Implantação(ões)</Label>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Etapa</Label>
                  <Select value={etapaTemp.nome} onValueChange={(value) => setEtapaTemp({ ...etapaTemp, nome: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {etapasOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Situação da Etapa</Label>
                  <Select
                    value={etapaTemp.situacao}
                    onValueChange={(value) => setEtapaTemp({ ...etapaTemp, situacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      {situacoesEtapaOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <DatePickerSimple
                    date={etapaTemp.inicio}
                    setDate={(date) => setEtapaTemp({ ...etapaTemp, inicio: date })}
                  />
                </div>

                <div>
                  <Label>Data de Fim</Label>
                  <DatePickerSimple
                    date={etapaTemp.fim}
                    setDate={(date) => setEtapaTemp({ ...etapaTemp, fim: date })}
                  />
                </div>
              </div>

              <Button type="button" onClick={adicionarEtapa} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Etapa
              </Button>
            </CardContent>
          </Card>

          {form.watch("etapas")?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Etapas adicionadas:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Etapa</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch("etapas").map((etapa, index) => (
                      <TableRow key={index}>
                        <TableCell>{etapa.nome}</TableCell>
                        <TableCell>{etapa.situacao}</TableCell>
                        <TableCell>{etapa.inicio.toLocaleDateString()}</TableCell>
                        <TableCell>{etapa.fim.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removerEtapa(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <FormField
          control={form.control}
          name="situacoesCriticas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação(ões) Crítica(s) Identificada(s)</FormLabel>
              <FormControl>
                <MultiSelectSimple
                  options={situacoesCriticasOptions.map((option) => ({
                    label: option,
                    value: option,
                  }))}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione as situações críticas"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {form.watch("situacoesCriticas")?.includes("Outro") && (
          <FormField
            control={form.control}
            name="outraSituacaoCritica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especifique outra situação crítica</FormLabel>
                <FormControl>
                  <Input placeholder="Descreva a situação crítica" {...field} />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <Label>Solução(ões) Proposta(s) Realizada(s)</Label>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Data</Label>
                  <DatePickerSimple
                    date={solucaoTemp.data}
                    setDate={(date) => setSolucaoTemp({ ...solucaoTemp, data: date })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva a solução proposta"
                    value={solucaoTemp.descricao}
                    onChange={(e) => setSolucaoTemp({ ...solucaoTemp, descricao: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <Button type="button" onClick={adicionarSolucao} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Solução
              </Button>
            </CardContent>
          </Card>

          {form.watch("solucoes")?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Soluções adicionadas:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch("solucoes").map((solucao, index) => (
                      <TableRow key={index}>
                        <TableCell>{solucao.data.toLocaleDateString()}</TableCell>
                        <TableCell>{solucao.descricao}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removerSolucao(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <FormField
          control={form.control}
          name="detalhamentoAdicional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalhamento Adicional da(s) Implantação(ões)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Forneça detalhes adicionais sobre a implantação"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

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

        <div className="space-y-4">
          <Label>Nome e CPF do(s) Técnico(s)/Gestor(es) do Cliente</Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div>
          <Label>Anexar Documento(s)</Label>
          <FileUploader onChange={handleFileChange} value={anexos} />
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
