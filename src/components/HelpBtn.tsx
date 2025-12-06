import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, BookOpen, ShieldCheck } from "lucide-react";

export function HelpBtn() {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 animate-in fade-in zoom-in duration-300 hover:scale-105 transition-transform"
          variant="default"
        >
          <HelpCircle className="h-8 w-8" />
          <span className="sr-only">Ajuda</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Central de Ajuda
          </DialogTitle>
          <DialogDescription>
            Perguntas frequentes sobre a utilização do CAJUHUB.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Accordion type="single" collapsible className="w-full">
            {/* --- GENERAL USER QUESTIONS (PORTUGUESE) --- */}
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 mt-4 uppercase tracking-wider">
              Geral
            </h3>

            <AccordionItem value="item-1">
              <AccordionTrigger>
                O que significam as cores no mapa?
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <p>
                    As cores indicam a disponibilidade da sala no horário
                    selecionado:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-200 border border-green-600"></div>
                    <span>
                      <strong>Verde:</strong> A sala está livre para reserva.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-200 border border-red-600"></div>
                    <span>
                      <strong>Vermelho:</strong> A sala já está ocupada neste
                      horário.
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                Como faço para cancelar uma reserva?
              </AccordionTrigger>
              <AccordionContent>
                Vá até a página <strong>"Minhas Reservas"</strong> (My Bookings)
                no menu superior. Lá você verá uma lista de todos os seus
                agendamentos futuros. Clique no botão "Cancel" ao lado da
                reserva desejada.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                Posso reservar uma sala por quanto tempo?
              </AccordionTrigger>
              <AccordionContent>
                Atualmente não há limite máximo de tempo, desde que o horário
                esteja disponível e não conflite com outras reservas existentes.
                O sistema bloqueará automaticamente tentativas de agendamento em
                horários já ocupados.
              </AccordionContent>
            </AccordionItem>

            {/* --- ADMIN ONLY QUESTIONS (PORTUGUESE) --- */}
            {isAdmin && (
              <>
                <div className="flex items-center gap-2 mt-6 mb-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Administrador
                  </h3>
                </div>

                <AccordionItem value="admin-1">
                  <AccordionTrigger>
                    Como crio uma sala com formato irregular?
                  </AccordionTrigger>
                  <AccordionContent>
                    No Editor, selecione a ferramenta <strong>Polygon</strong>.
                    Clique no mapa para marcar cada ponto (vértice) da sala.
                    Para fechar a forma e criar a sala, dê um
                    <strong> clique duplo</strong> ou clique novamente no ponto
                    inicial.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-2">
                  <AccordionTrigger>
                    Como excluo um andar inteiro?
                  </AccordionTrigger>
                  <AccordionContent>
                    No Editor, clique no ícone de <strong>Configurações</strong>{" "}
                    (engrenagem) ao lado do seletor de andares. Vá para a aba
                    "Edit Current" e clique em "Delete Floor".
                    <br />
                    <br />
                    <strong>Atenção:</strong> Isso excluirá permanentemente
                    todas as salas e todas as reservas associadas a esse andar.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-3">
                  <AccordionTrigger>
                    Como forçar o cancelamento de uma reserva?
                  </AccordionTrigger>
                  <AccordionContent>
                    Acesse o <strong>Dashboard</strong> (Menu Admin &gt;
                    Dashboard). Utilize a barra de busca para encontrar a
                    reserva pelo e-mail do usuário ou nome da sala. Clique no
                    ícone de lixeira para forçar a exclusão imediata.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="admin-4">
                  <AccordionTrigger>Como renomear uma sala?</AccordionTrigger>
                  <AccordionContent>
                    No Editor, certifique-se de que a ferramenta{" "}
                    <strong>Select</strong> está ativa. Clique sobre a sala
                    desejada para abrir a janela de propriedades, onde você pode
                    alterar o nome, capacidade e tipo.
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
