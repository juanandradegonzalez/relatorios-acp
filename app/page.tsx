import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormServicos } from "@/components/form-servicos"
import { FormImplantacao } from "@/components/form-implantacao"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-80 h-40 relative mb-4">
            <Image
              src="/img/logo.png"
              alt="ACP - Assessoria Contábil e Patrimonial"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            Sistema de Geração de Relatórios Técnicos
          </h1>
          <p className="text-gray-600 mt-2 text-center max-w-2xl">
            Gere relatórios detalhados para processos de implantação de serviços e atendimentos técnicos.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Tabs defaultValue="servicos">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="servicos">Relatório de Serviços</TabsTrigger>
              <TabsTrigger value="implantacao">Relatório de Implantação</TabsTrigger>
            </TabsList>
            <TabsContent value="servicos">
              <FormServicos />
            </TabsContent>
            <TabsContent value="implantacao">
              <FormImplantacao />
            </TabsContent>
          </Tabs>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} ACP - Assessoria Contábil e Patrimonial. Todos os direitos reservados.</p>
        </footer>
      </div>
    </main>
  )
}
