import { jsPDF } from "jspdf"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PDFGeneratorResult {
  success: boolean
  message?: string
}

interface PDFGeneratorOptions {
  tipoRelatorio: "servicos" | "migracao"
  dados: any
  anexos: File[]
}

// Modificar a paleta de cores para usar tons de verde semelhantes à logomarca
const COLORS = {
  primary: [26, 69, 67], // Verde escuro (semelhante ao da logomarca)
  secondary: [58, 115, 95], // Verde médio
  accent: [207, 184, 124], // Dourado/bege (semelhante ao texto da logomarca)
  neutral: [240, 240, 240], // Cinza claro
  neutralDark: [200, 200, 200], // Cinza médio
  text: [51, 51, 51], // Quase preto
  textLight: [120, 120, 120], // Cinza escuro
  white: [255, 255, 255], // Branco
  sectionBg: [240, 248, 245], // Fundo verde muito claro
  tableBorder: [230, 230, 230], // Cinza claro para bordas
  tableHeader: [235, 245, 240], // Verde azulado claro
  tableRowEven: [255, 255, 255], // Branco
  tableRowOdd: [240, 248, 245], // Verde muito claro
}

// Remover a função addSignatures completamente
// Substituir por uma função vazia para manter compatibilidade
function addSignatures(doc: jsPDF, dados: any): void {
  // Função vazia - assinaturas removidas conforme solicitado
}

// Modificar a função addServicosContent para garantir que o resumo não seja cortado
function addServicosContent(doc: jsPDF, dados: any): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 45
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // SEÇÃO: INFORMAÇÕES GERAIS
  yPos = addSectionTitle(doc, "INFORMAÇÕES GERAIS", margin, yPos)

  // Grid de informações básicas
  const boxWidth = contentWidth / 2 - 5
  const boxHeight = 25

  // Primeira linha: Estado e Município
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])

  // Box Estado
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("ESTADO", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(dados.estado || "Não informado", margin + 10, yPos + 18)

  // Box Município - Forçando a cor de fundo clara
  doc.setFillColor(248, 250, 252) // Definindo explicitamente a cor clara
  doc.roundedRect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("MUNICÍPIO", margin + boxWidth + 20, yPos + 8)

  // Garantir que a mesma cor de texto seja usada para o valor do município
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(dados.municipio || "Não informado", margin + boxWidth + 20, yPos + 18)

  yPos += boxHeight + 10

  // SEÇÃO: ENTIDADES
  if (dados.entidadesOrgaos && dados.entidadesOrgaos.length > 0) {
    yPos = addSectionTitle(doc, "ENTIDADES", margin, yPos)

    // Lista de entidades
    doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
    const entidadesHeight = Math.max(dados.entidadesOrgaos.length * 12 + 10, 30)
    doc.roundedRect(margin, yPos, contentWidth, entidadesHeight, 3, 3, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    let entidadeY = yPos + 10
    dados.entidadesOrgaos.forEach((item: any, index: number) => {
      // Ícone numérico
      doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
      doc.circle(margin + 10, entidadeY - 3, 3, "F")

      // Texto da entidade
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
      doc.text(`${item.entidade} (CNPJ: ${item.cnpj})`, margin + 20, entidadeY)
      entidadeY += 12
    })

    yPos += entidadesHeight + 10
  }

  // SEÇÃO: DETALHES DO SERVIÇO
  yPos = addSectionTitle(doc, "DETALHES DO SERVIÇO", margin, yPos)

  // Módulos
  let modulos =
    dados.modulos && dados.modulos.length > 0
      ? dados.modulos.filter((m: string) => m !== "Outro").join(", ")
      : "Não informado"

  if (dados.modulos && dados.modulos.includes("Outro") && dados.outroModulo) {
    modulos += `, ${dados.outroModulo}`
  }

  // Box Módulos
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  const modulosText = doc.splitTextToSize(modulos, contentWidth - 20)
  const modulosHeight = Math.max(modulosText.length * 6 + 15, 30)

  doc.roundedRect(margin, yPos, contentWidth, modulosHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("MÓDULOS", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(modulosText, margin + 10, yPos + 18)

  yPos += modulosHeight + 10

  // Serviços realizados
  let servicos =
    dados.servicosRealizados && dados.servicosRealizados.length > 0
      ? dados.servicosRealizados.filter((s: string) => s !== "Outro").join(", ")
      : "Não informado"

  if (dados.servicosRealizados && dados.servicosRealizados.includes("Outro") && dados.outroServico) {
    servicos += `, ${dados.outroServico}`
  }

  // Box Serviços
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  const servicosText = doc.splitTextToSize(servicos, contentWidth - 20)
  const servicosHeight = Math.max(servicosText.length * 6 + 15, 30)

  doc.roundedRect(margin, yPos, contentWidth, servicosHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("SERVIÇOS REALIZADOS", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(servicosText, margin + 10, yPos + 18)

  yPos += servicosHeight + 10

  // Data do serviço
  const dataFormatada = dados.dataServico
    ? format(new Date(dados.dataServico), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Não informada"

  // Box Data
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("DATA DA PRESTAÇÃO DO SERVIÇO", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(dataFormatada, margin + 10, yPos + 18)

  yPos += 40

  // Verificar se há espaço suficiente para a seção de resumo
  // Calcular o espaço necessário para o resumo
  const resumoText = doc.splitTextToSize(dados.resumoServicos || "Não informado", contentWidth - 20)
  const resumoHeight = Math.max(resumoText.length * 6 + 30, 50) // Aumentei a altura mínima

  // Verificar se há espaço suficiente na página atual
  if (yPos + resumoHeight + 30 > pageHeight - 30) {
    // Não há espaço suficiente, adicionar nova página
    doc.addPage()
    addHeader(doc, "servicos")
    yPos = 45
  }

  // SEÇÃO: RESUMO DO SERVIÇO
  yPos = addSectionTitle(doc, "RESUMO DO SERVIÇO", margin, yPos)

  // Box Resumo
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  doc.roundedRect(margin, yPos, contentWidth, resumoHeight, 3, 3, "F")
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(resumoText, margin + 10, yPos + 10)

  yPos += resumoHeight + 15

  // Verificar se há espaço suficiente para a seção de técnicos
  if (yPos > pageHeight - 80) {
    doc.addPage()
    addHeader(doc, "servicos")
    yPos = 45
  }

  // SEÇÃO: TÉCNICOS RESPONSÁVEIS
  yPos = addSectionTitle(doc, "TÉCNICOS RESPONSÁVEIS", margin, yPos)

  // Tabela de técnicos
  // Cabeçalho da tabela
  doc.setFillColor(COLORS.tableHeader[0], COLORS.tableHeader[1], COLORS.tableHeader[2])
  doc.roundedRect(margin, yPos, contentWidth, 10, 3, 3, "F")

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("FUNÇÃO", margin + 10, yPos + 7)
  doc.text("NOME", margin + contentWidth / 2, yPos + 7)

  yPos += 10

  // Linha 1: Técnicos especializados
  doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
  doc.rect(margin, yPos, contentWidth, 12, "F")

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("Técnico(s) Especializado(s)", margin + 10, yPos + 8)

  doc.setFont("helvetica", "normal")
  // Quebrar o texto dos técnicos em múltiplas linhas se necessário
  const tecnicosText = dados.tecnicos && dados.tecnicos.length > 0 ? dados.tecnicos.join(", ") : "Não informado"
  const tecnicosSplit = doc.splitTextToSize(tecnicosText, contentWidth / 2 - 10)
  const tecnicosHeight = Math.max(tecnicosSplit.length * 6, 12)

  // Ajustar a altura da célula se necessário
  if (tecnicosSplit.length > 1) {
    // Redesenhar o retângulo com altura maior
    doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
    doc.rect(margin, yPos, contentWidth, tecnicosHeight, "F")

    // Redesenhar o texto da função
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s) Especializado(s)", margin + 10, yPos + 8)
  }

  // Desenhar o texto dos técnicos
  doc.text(tecnicosSplit, margin + contentWidth / 2, yPos + 8)

  // Atualizar a posição Y se a altura foi ajustada
  if (tecnicosSplit.length > 1) {
    yPos += tecnicosHeight
  } else {
    yPos += 12
  }

  // Linha 2: Técnicos do cliente
  if (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0) {
    doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])

    // Calcular altura necessária para o texto dos clientes
    const clientesText = dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", ")
    const splitClientes = doc.splitTextToSize(clientesText, contentWidth / 2 - 10)
    const clientesHeight = Math.max(splitClientes.length * 6, 12)

    doc.rect(margin, yPos, contentWidth, clientesHeight, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s)/Gestor(es) do Cliente", margin + 10, yPos + 8)

    doc.setFont("helvetica", "normal")
    doc.text(splitClientes, margin + contentWidth / 2, yPos + 8)

    yPos += clientesHeight
  } else {
    doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])
    doc.rect(margin, yPos, contentWidth, 12, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s)/Gestor(es) do Cliente", margin + 10, yPos + 8)

    doc.setFont("helvetica", "normal")
    doc.text("Não informado", margin + contentWidth / 2, yPos + 8)

    yPos += 12
  }

  // Borda da tabela
  doc.setDrawColor(COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2])
  doc.setLineWidth(0.1)
  doc.roundedRect(
    margin,
    yPos -
      12 -
      (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0
        ? doc.splitTextToSize(
            dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", "),
            contentWidth / 2 - 10,
          ).length * 6
        : 12),
    contentWidth,
    12 +
      (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0
        ? doc.splitTextToSize(
            dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", "),
            contentWidth / 2 - 10,
          ).length * 6
        : 12),
    3,
    3,
    "S",
  )
}

// Modificar a função addMigracaoContent para garantir que o conteúdo não seja cortado
function addMigracaoContent(doc: jsPDF, dados: any): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 45
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // SEÇÃO: INFORMAÇÕES GERAIS
  yPos = addSectionTitle(doc, "INFORMAÇÕES GERAIS", margin, yPos)

  // Grid de informações básicas
  const boxWidth = contentWidth / 2 - 5
  const boxHeight = 25

  // Primeira linha: Estado e Município
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])

  // Box Estado
  doc.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("ESTADO", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(dados.estado || "Não informado", margin + 10, yPos + 18)

  // Box Município - Forçando a cor de fundo clara
  doc.setFillColor(248, 250, 252) // Definindo explicitamente a cor clara
  doc.roundedRect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("MUNICÍPIO", margin + boxWidth + 20, yPos + 8)

  // Garantir que a mesma cor de texto seja usada para o valor do município
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(dados.municipio || "Não informado", margin + boxWidth + 20, yPos + 18)

  yPos += boxHeight + 10

  // SEÇÃO: ENTIDADES
  if (dados.entidadesOrgaos && dados.entidadesOrgaos.length > 0) {
    yPos = addSectionTitle(doc, "ENTIDADES", margin, yPos)

    // Lista de entidades
    doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
    const entidadesHeight = Math.max(dados.entidadesOrgaos.length * 12 + 10, 30)
    doc.roundedRect(margin, yPos, contentWidth, entidadesHeight, 3, 3, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    let entidadeY = yPos + 10
    dados.entidadesOrgaos.forEach((item: any, index: number) => {
      // Ícone numérico
      doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
      doc.circle(margin + 10, entidadeY - 3, 3, "F")

      // Texto da entidade
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
      doc.text(`${item.entidade} (CNPJ: ${item.cnpj})`, margin + 20, entidadeY)
      entidadeY += 12
    })

    yPos += entidadesHeight + 10
  }

  // SEÇÃO: DETALHES DA MIGRAÇÃO
  yPos = addSectionTitle(doc, "DETALHES DA MIGRAÇÃO", margin, yPos)

  // Módulos
  let modulos =
    dados.modulos && dados.modulos.length > 0
      ? dados.modulos.filter((m: string) => m !== "Outro").join(", ")
      : "Não informado"

  if (dados.modulos && dados.modulos.includes("Outro") && dados.outroModulo) {
    modulos += `, ${dados.outroModulo}`
  }

  // Box Módulos
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  const modulosText = doc.splitTextToSize(modulos, contentWidth - 20)
  const modulosHeight = Math.max(modulosText.length * 6 + 15, 30)

  doc.roundedRect(margin, yPos, contentWidth, modulosHeight, 3, 3, "F")
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("MÓDULOS", margin + 10, yPos + 8)

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(modulosText, margin + 10, yPos + 18)

  yPos += modulosHeight + 15

  // Verificar se há espaço suficiente para a seção de etapas
  if (dados.etapas && dados.etapas.length > 0) {
    // Calcular altura necessária para a tabela de etapas
    const etapasHeight = dados.etapas.length * 15 + 20 // Altura aproximada

    // Verificar se há espaço suficiente na página atual
    if (yPos + etapasHeight + 30 > pageHeight - 30) {
      // Não há espaço suficiente, adicionar nova página
      doc.addPage()
      addHeader(doc, "migracao")
      yPos = 45
    }

    // SEÇÃO: ETAPAS DA MIGRAÇÃO
    yPos = addSectionTitle(doc, "ETAPAS DA MIGRAÇÃO", margin, yPos)

    // Tabela de etapas
    // Cabeçalho da tabela
    doc.setFillColor(COLORS.tableHeader[0], COLORS.tableHeader[1], COLORS.tableHeader[2])
    doc.roundedRect(margin, yPos, contentWidth, 10, 3, 3, "F")

    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("ETAPA", margin + 10, yPos + 7)
    doc.text("SITUAÇÃO", margin + contentWidth * 0.5, yPos + 7)
    doc.text("INÍCIO", margin + contentWidth * 0.7, yPos + 7)
    doc.text("FIM", margin + contentWidth * 0.85, yPos + 7)

    yPos += 10

    // Linhas da tabela
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    const tableStartY = yPos

    dados.etapas.forEach((etapa: any, index: number) => {
      // Alternar cores de fundo
      if (index % 2 === 0) {
        doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
      } else {
        doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])
      }

      // Calcular altura necessária para o nome da etapa
      const etapaText = doc.splitTextToSize(etapa.nome, contentWidth * 0.45)
      const rowHeight = Math.max(etapaText.length * 6, 10)

      doc.rect(margin, yPos, contentWidth, rowHeight, "F")

      // Texto da tabela
      doc.text(etapaText, margin + 10, yPos + 6)
      doc.text(etapa.situacao, margin + contentWidth * 0.5, yPos + 6)
      doc.text(format(new Date(etapa.inicio), "dd/MM/yyyy"), margin + contentWidth * 0.7, yPos + 6)
      doc.text(format(new Date(etapa.fim), "dd/MM/yyyy"), margin + contentWidth * 0.85, yPos + 6)

      yPos += rowHeight
    })

    // Borda da tabela
    doc.setDrawColor(COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2])
    doc.setLineWidth(0.1)
    doc.roundedRect(margin, tableStartY - 10, contentWidth, yPos - tableStartY + 10, 3, 3, "S")

    yPos += 15
  }

  // Verificar se precisa adicionar nova página para situações críticas
  if (dados.situacoesCriticas && dados.situacoesCriticas.length > 0) {
    // Calcular altura necessária para a seção
    let situacoes = dados.situacoesCriticas.filter((s: string) => s !== "Outro").join(", ")
    if (dados.situacoesCriticas.includes("Outro") && dados.outraSituacaoCritica) {
      situacoes += `, ${dados.outraSituacaoCritica}`
    }

    const situacoesText = doc.splitTextToSize(situacoes, contentWidth - 20)
    const situacoesHeight = Math.max(situacoesText.length * 6 + 30, 40)

    // Verificar se há espaço suficiente
    if (yPos + situacoesHeight + 30 > pageHeight - 30) {
      doc.addPage()
      addHeader(doc, "migracao")
      yPos = 45
    }

    // SEÇÃO: SITUAÇÕES CRÍTICAS
    yPos = addSectionTitle(doc, "SITUAÇÕES CRÍTICAS IDENTIFICADAS", margin, yPos)

    // Box Situações
    doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
    doc.roundedRect(margin, yPos, contentWidth, situacoesHeight, 3, 3, "F")
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(situacoesText, margin + 10, yPos + 10)

    yPos += situacoesHeight + 15
  }

  // Verificar se precisa adicionar nova página para soluções
  if (dados.solucoes && dados.solucoes.length > 0) {
    // Calcular altura necessária para a tabela de soluções
    const solucoesHeight = dados.solucoes.length * 15 + 20 // Altura aproximada

    // Verificar se há espaço suficiente
    if (yPos + solucoesHeight + 30 > pageHeight - 30) {
      doc.addPage()
      addHeader(doc, "migracao")
      yPos = 45
    }

    // SEÇÃO: SOLUÇÕES PROPOSTAS
    yPos = addSectionTitle(doc, "SOLUÇÕES PROPOSTAS", margin, yPos)

    // Tabela de soluções
    // Cabeçalho da tabela
    doc.setFillColor(COLORS.tableHeader[0], COLORS.tableHeader[1], COLORS.tableHeader[2])
    doc.roundedRect(margin, yPos, contentWidth, 10, 3, 3, "F")

    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("DATA", margin + 10, yPos + 7)
    doc.text("DESCRIÇÃO", margin + 40, yPos + 7)

    yPos += 10

    // Linhas da tabela
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    const tableStartY = yPos

    dados.solucoes.forEach((solucao: any, index: number) => {
      // Alternar cores de fundo
      if (index % 2 === 0) {
        doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
      } else {
        doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])
      }

      // Calcular altura necessária para a descrição
      const descricaoText = doc.splitTextToSize(solucao.descricao, contentWidth - 50)
      const rowHeight = Math.max(descricaoText.length * 6, 10)

      doc.rect(margin, yPos, contentWidth, rowHeight, "F")

      // Texto da tabela
      doc.text(format(new Date(solucao.data), "dd/MM/yyyy"), margin + 10, yPos + 6)
      doc.text(descricaoText, margin + 40, yPos + 6)

      yPos += rowHeight
    })

    // Borda da tabela
    doc.setDrawColor(COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2])
    doc.setLineWidth(0.1)
    doc.roundedRect(margin, tableStartY - 10, contentWidth, yPos - tableStartY + 10, 3, 3, "S")

    yPos += 15
  }

  // Verificar se precisa adicionar nova página para detalhamento adicional
  if (dados.detalhamentoAdicional) {
    // Calcular altura necessária para o detalhamento
    const detalhamentoText = doc.splitTextToSize(dados.detalhamentoAdicional, contentWidth - 20)
    const detalhamentoHeight = Math.max(detalhamentoText.length * 6 + 30, 40)

    // Verificar se há espaço suficiente
    if (yPos + detalhamentoHeight + 30 > pageHeight - 30) {
      doc.addPage()
      addHeader(doc, "migracao")
      yPos = 45
    }

    // SEÇÃO: DETALHAMENTO ADICIONAL
    yPos = addSectionTitle(doc, "DETALHAMENTO ADICIONAL", margin, yPos)

    // Box Detalhamento
    doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
    doc.roundedRect(margin, yPos, contentWidth, detalhamentoHeight, 3, 3, "F")
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(detalhamentoText, margin + 10, yPos + 10)

    yPos += detalhamentoHeight + 15
  }

  // Verificar se precisa adicionar nova página para data do serviço
  if (yPos + 50 > pageHeight - 30) {
    doc.addPage()
    addHeader(doc, "migracao")
    yPos = 45
  }

  // SEÇÃO: DATA DO SERVIÇO
  yPos = addSectionTitle(doc, "DATA DO SERVIÇO", margin, yPos)

  // Box Data
  doc.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F")

  const dataFormatada = dados.dataServico
    ? format(new Date(dados.dataServico), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "Não informada"

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(dataFormatada, margin + contentWidth / 2, yPos + 15, { align: "center" })

  yPos += 40

  // Verificar se há espaço suficiente para a seção de técnicos
  if (yPos + 50 > pageHeight - 30) {
    doc.addPage()
    addHeader(doc, "migracao")
    yPos = 45
  }

  // SEÇÃO: TÉCNICOS RESPONSÁVEIS
  yPos = addSectionTitle(doc, "TÉCNICOS RESPONSÁVEIS", margin, yPos)

  // Tabela de técnicos
  // Cabeçalho da tabela
  doc.setFillColor(COLORS.tableHeader[0], COLORS.tableHeader[1], COLORS.tableHeader[2])
  doc.roundedRect(margin, yPos, contentWidth, 10, 3, 3, "F")

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("FUNÇÃO", margin + 10, yPos + 7)
  doc.text("NOME", margin + contentWidth / 2, yPos + 7)

  yPos += 10

  // Linha 1: Técnicos especializados
  doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
  doc.rect(margin, yPos, contentWidth, 12, "F")

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("Técnico(s) Especializado(s)", margin + 10, yPos + 8)

  doc.setFont("helvetica", "normal")
  // Quebrar o texto dos técnicos em múltiplas linhas se necessário
  const tecnicosText = dados.tecnicos && dados.tecnicos.length > 0 ? dados.tecnicos.join(", ") : "Não informado"
  const tecnicosSplit = doc.splitTextToSize(tecnicosText, contentWidth / 2 - 10)
  const tecnicosHeight = Math.max(tecnicosSplit.length * 6, 12)

  // Ajustar a altura da célula se necessário
  if (tecnicosSplit.length > 1) {
    // Redesenhar o retângulo com altura maior
    doc.setFillColor(COLORS.tableRowEven[0], COLORS.tableRowEven[1], COLORS.tableRowEven[2])
    doc.rect(margin, yPos, contentWidth, tecnicosHeight, "F")

    // Redesenhar o texto da função
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s) Especializado(s)", margin + 10, yPos + 8)
  }

  // Desenhar o texto dos técnicos
  doc.text(tecnicosSplit, margin + contentWidth / 2, yPos + 8)

  // Atualizar a posição Y se a altura foi ajustada
  if (tecnicosSplit.length > 1) {
    yPos += tecnicosHeight
  } else {
    yPos += 12
  }

  // Linha 2: Técnicos do cliente
  if (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0) {
    doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])

    // Calcular altura necessária para o texto dos clientes
    const clientesText = dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", ")
    const splitClientes = doc.splitTextToSize(clientesText, contentWidth / 2 - 10)
    const clientesHeight = Math.max(splitClientes.length * 6, 12)

    doc.rect(margin, yPos, contentWidth, clientesHeight, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s)/Gestor(es) do Cliente", margin + 10, yPos + 8)

    doc.setFont("helvetica", "normal")
    doc.text(splitClientes, margin + contentWidth / 2, yPos + 8)

    yPos += clientesHeight
  } else {
    doc.setFillColor(COLORS.tableRowOdd[0], COLORS.tableRowOdd[1], COLORS.tableRowOdd[2])
    doc.rect(margin, yPos, contentWidth, 12, "F")

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Técnico(s)/Gestor(es) do Cliente", margin + 10, yPos + 8)

    doc.setFont("helvetica", "normal")
    doc.text("Não informado", margin + contentWidth / 2, yPos + 8)

    yPos += 12
  }

  // Borda da tabela
  doc.setDrawColor(COLORS.tableBorder[0], COLORS.tableBorder[1], COLORS.tableBorder[2])
  doc.setLineWidth(0.1)
  doc.roundedRect(
    margin,
    yPos -
      12 -
      (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0
        ? doc.splitTextToSize(
            dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", "),
            contentWidth / 2 - 10,
          ).length * 6
        : 12),
    contentWidth,
    12 +
      (dados.clienteNomeCpf && dados.clienteNomeCpf.length > 0
        ? doc.splitTextToSize(
            dados.clienteNomeCpf.map((cliente: any) => `${cliente.nome} (CPF: ${cliente.cpf})`).join(", "),
            contentWidth / 2 - 10,
          ).length * 6
        : 12),
    3,
    3,
    "S",
  )
}

// Modificar a função generatePDF para remover a chamada de assinaturas
export async function generatePDF({ tipoRelatorio, dados, anexos }: PDFGeneratorOptions): Promise<PDFGeneratorResult> {
  try {
    // Criar uma nova instância do jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Adicionar fontes personalizadas
    doc.setFont("helvetica", "normal")

    // Adicionar cabeçalho
    addHeader(doc, tipoRelatorio)

    // Adicionar conteúdo com base no tipo de relatório
    if (tipoRelatorio === "servicos") {
      addServicosContent(doc, dados)
    } else {
      addMigracaoContent(doc, dados)
    }

    // Remover a chamada para addSignatures
    // addSignatures(doc, dados) - Removido conforme solicitado

    // Adicionar rodapé em todas as páginas
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(doc, i, totalPages)
    }

    // Salvar o PDF principal
    doc.save(`relatorio-${tipoRelatorio}-${format(new Date(), "dd-MM-yyyy")}.pdf`)

    // Se houver anexos, gerar o PDF de anexos separadamente
    if (anexos.length > 0) {
      await generateAttachmentsPDF(anexos, tipoRelatorio)
    }

    return {
      success: true,
      message:
        anexos.length > 0
          ? "Foram gerados dois PDFs: o relatório principal e outro com os anexos."
          : "O relatório foi gerado com sucesso.",
    }
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    return {
      success: false,
      message: "Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.",
    }
  }
}

function addHeader(doc: jsPDF, tipoRelatorio: string): void {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Barra superior colorida
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.rect(0, 0, pageWidth, 12, "F")

  // Logo ou nome da empresa (lado esquerdo)
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2])
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("ACP", 15, 8)

  // Data do relatório (lado direito)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  const dataAtual = format(new Date(), "dd/MM/yyyy", { locale: ptBR })
  doc.text(dataAtual, pageWidth - 15, 8, { align: "right" })

  // Título principal do relatório
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  const titulo = tipoRelatorio === "servicos" ? "Relatório Técnico de Serviços" : "Relatório Técnico de Implantação"
  doc.text(titulo, pageWidth / 2, 30, { align: "center" })

  // Linha decorativa sob o título
  doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 - 50, 34, pageWidth / 2 + 50, 34)
}

function addSectionTitle(doc: jsPDF, title: string, margin: number, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - 2 * margin

  // Ícone de seção
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.roundedRect(margin, yPos, 5, 5, 1, 1, "F")

  // Título da seção
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text(title, margin + 10, yPos + 4)

  // Linha decorativa
  doc.setDrawColor(COLORS.neutralDark[0], COLORS.neutralDark[1], COLORS.neutralDark[2])
  doc.setLineWidth(0.2)
  doc.line(margin + 10 + doc.getTextWidth(title) + 5, yPos + 2, margin + contentWidth, yPos + 2)

  return yPos + 10
}

function addFooter(doc: jsPDF, currentPage: number, totalPages: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Linha separadora
  doc.setDrawColor(COLORS.neutralDark[0], COLORS.neutralDark[1], COLORS.neutralDark[2])
  doc.setLineWidth(0.2)
  doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15)

  // Informações do rodapé
  doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2])
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")

  // Logo ou nome da empresa (lado esquerdo)
  doc.text("ACP - Assessoria Contábil e Patrimonial © " + new Date().getFullYear(), 15, pageHeight - 8)

  // Número da página (centro)
  doc.text(`Página ${currentPage} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" })

  // Data de geração (lado direito)
  const dataGeracao = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })
  doc.text(`Gerado em: ${dataGeracao}`, pageWidth - 15, pageHeight - 8, { align: "right" })
}

async function generateAttachmentsPDF(anexos: File[], tipoRelatorio: string): Promise<void> {
  if (anexos.length === 0) return

  // Criar um novo documento PDF para os anexos
  const anexosPdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = anexosPdf.internal.pageSize.getWidth()
  let yPos = 45
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // Adicionar cabeçalho
  anexosPdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  anexosPdf.rect(0, 0, pageWidth, 12, "F")

  anexosPdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2])
  anexosPdf.setFontSize(10)
  anexosPdf.setFont("helvetica", "bold")
  anexosPdf.text("ACP", 15, 8)

  anexosPdf.setFontSize(8)
  anexosPdf.setFont("helvetica", "normal")
  const dataAtual = format(new Date(), "dd/MM/yyyy", { locale: ptBR })
  anexosPdf.text(dataAtual, pageWidth - 15, 8, { align: "right" })

  // Título principal
  anexosPdf.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
  anexosPdf.setFontSize(22)
  anexosPdf.setFont("helvetica", "bold")
  anexosPdf.text("Anexos do Relatório", pageWidth / 2, 30, { align: "center" })

  anexosPdf.setFontSize(14)
  anexosPdf.text(tipoRelatorio === "servicos" ? "Serviços" : "Implantação", pageWidth / 2, 40, { align: "center" })

  // Linha decorativa sob o título
  anexosPdf.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
  anexosPdf.setLineWidth(0.5)
  anexosPdf.line(pageWidth / 2 - 50, 44, pageWidth / 2 + 50, 44)

  // SEÇÃO: DOCUMENTOS ANEXADOS
  yPos = addSectionTitle(anexosPdf, "DOCUMENTOS ANEXADOS", margin, yPos + 10)

  // Listar os anexos
  for (let i = 0; i < anexos.length; i++) {
    const anexo = anexos[i]

    // Box para cada anexo
    anexosPdf.setFillColor(COLORS.sectionBg[0], COLORS.sectionBg[1], COLORS.sectionBg[2])
    anexosPdf.roundedRect(margin, yPos, contentWidth, 40, 3, 3, "F")

    // Número do anexo
    anexosPdf.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2])
    anexosPdf.circle(margin + 15, yPos + 15, 8, "F")

    anexosPdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2])
    anexosPdf.setFontSize(10)
    anexosPdf.setFont("helvetica", "bold")
    anexosPdf.text(`${i + 1}`, margin + 15, yPos + 18, { align: "center" })

    // Informações do anexo
    anexosPdf.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
    anexosPdf.setFontSize(11)
    anexosPdf.setFont("helvetica", "bold")
    anexosPdf.text(anexo.name, margin + 30, yPos + 15)

    anexosPdf.setFontSize(9)
    anexosPdf.setFont("helvetica", "normal")

    // Tamanho do arquivo
    const fileSizeMB = (anexo.size / (1024 * 1024)).toFixed(2)
    anexosPdf.text(`Tamanho: ${fileSizeMB} MB`, margin + 30, yPos + 25)

    // Tipo de arquivo
    anexosPdf.text(`Tipo: ${anexo.type || "Não especificado"}`, margin + 30, yPos + 33)

    yPos += 50

    // Adicionar nova página se necessário
    if (yPos > anexosPdf.internal.pageSize.getHeight() - 60 && i < anexos.length - 1) {
      // Adicionar rodapé na página atual
      addFooter(anexosPdf, anexosPdf.internal.getCurrentPageInfo().pageNumber, anexosPdf.internal.getNumberOfPages())

      anexosPdf.addPage()

      // Adicionar cabeçalho na nova página
      anexosPdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
      anexosPdf.rect(0, 0, pageWidth, 12, "F")

      anexosPdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2])
      anexosPdf.setFontSize(10)
      anexosPdf.setFont("helvetica", "bold")
      anexosPdf.text("ACP", 15, 8)

      anexosPdf.setFontSize(8)
      anexosPdf.setFont("helvetica", "normal")
      anexosPdf.text(dataAtual, pageWidth - 15, 8, { align: "right" })

      yPos = 30
    }
  }

  // Adicionar nota sobre os anexos
  yPos += 10
  anexosPdf.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2])
  anexosPdf.setFontSize(9)
  anexosPdf.setFont("helvetica", "italic")
  anexosPdf.text("Nota: Os arquivos originais foram anexados separadamente e estão disponíveis", margin, yPos)
  yPos += 5
  anexosPdf.text("para consulta conforme necessário. Este documento serve como índice dos anexos.", margin, yPos)

  // Adicionar rodapé
  addFooter(anexosPdf, anexosPdf.internal.getCurrentPageInfo().pageNumber, anexosPdf.internal.getNumberOfPages())

  // Salvar o PDF de anexos separadamente
  anexosPdf.save(`anexos-relatorio-${tipoRelatorio}-${format(new Date(), "dd-MM-yyyy")}.pdf`)
}
