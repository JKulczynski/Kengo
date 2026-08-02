import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Send,
    Loader2,
    User,
    Zap
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { trackProductEvent } from "@/lib/analytics";

// Unikalny icon Kengo — ensō z kompasem
function KengoIcon({ className = "w-6 h-6" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-1.5-5" stroke="currentColor" strokeWidth="1.6" />
            <line x1="12" y1="8" x2="12" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="12" y1="14" x2="12" y2="16" stroke="currentColor" strokeWidth="1.2" />
            <line x1="8" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.2" />
            <line x1="14" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    );
}

function buildSystemContext(projects, documents) {
    const projectsSummary = projects.map(p => {
        const projectDocs = documents.filter(d => d.project_id === p.id);
        const spent = projectDocs.reduce((sum, d) => sum + (d.amount || 0), 0);
        return `- Projekt: "${p.name}" | Status: ${p.status} | Budżet: ${(p.budget || 0).toLocaleString('pl-PL')} zł | Wydano: ${spent.toLocaleString('pl-PL')} zł | Typ: ${p.type || 'brak'} | Opis: ${p.description || 'brak'} | Termin: ${p.target_completion || 'brak'}`;
    }).join('\n');

    const documentsSummary = documents.slice(0, 60).map(d =>
        `- Dokument: "${d.title}" | Typ: ${d.type} | Dostawca: ${d.vendor || 'brak'} | Kwota: ${d.amount ? `${d.amount.toLocaleString('pl-PL')} zł` : 'brak'} | Data: ${d.date || 'brak'} | Gwarancja do: ${d.warranty_end_date || 'brak'}`
    ).join('\n');

    return `Jesteś Kengo — ciepłym, pomocnym asystentem remontowym. Pomagasz użytkownikowi zarządzać jego projektami remontowymi.

DANE UŻYTKOWNIKA:

Projekty (${projects.length}):
${projectsSummary || 'Brak projektów'}

Dokumenty (${documents.length}):
${documentsSummary || 'Brak dokumentów'}

ZASADY:
- Odpowiadaj po polsku, ciepło i konkretnie
- Opieraj się na danych użytkownika — nie wymyślaj
- Gdy czegoś brakuje, sugeruj jak to uzupełnić w aplikacji
- Formatuj odpowiedzi czytelnie (listy, podsumowania)
- Nie udawaj, że masz więcej danych niż masz`;
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    return (
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? '' : 'icon-box'}`}
                style={isUser ? { backgroundColor: "var(--k-accent)" } : {}}
            >
                {isUser
                    ? <User className="w-4 h-4 text-white" />
                    : <KengoIcon className="w-4 h-4" />
                }
            </div>
            <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser ? 'rounded-tr-sm' : 'apple-shadow rounded-tl-sm'
                }`}
                style={isUser
                    ? { backgroundColor: "var(--k-accent)", color: "var(--k-accent-text)" }
                    : { backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }
                }
            >
                {message.content}
            </div>
        </div>
    );
}

const quickActions = [
    { label: "Moje projekty", prompt: "Podsumuj moje projekty — co jest aktywne, jaki jest budżet i co wymaga uwagi?" },
    { label: "Analiza wydatków", prompt: "Przeanalizuj moje wydatki i powiedz, gdzie idzie najwięcej pieniędzy." },
    { label: "Gwarancje", prompt: "Które gwarancje wygasają wkrótce? Daj mi przegląd." },
    { label: "Co dalej?", prompt: "Patrząc na moje projekty — co powinienem zrobić teraz, żeby posunąć prace do przodu?" },
    { label: "Ile wydałem?", prompt: "Ile łącznie wydałem na wszystkie projekty? Podsumuj według kategorii." },
];

export default function AssistantPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [projects, setProjects] = useState([]);
    const [documents, setDocuments] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => { loadUserData(); }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const loadUserData = async () => {
        setIsLoadingData(true);
        try {
            const [projectsData, documentsData] = await Promise.all([
                Project.list(),
                Document.list('-created_date', 100)
            ]);
            setProjects(projectsData);
            setDocuments(documentsData);
        } catch (error) {
            console.error("Error loading user data:", error);
        }
        setIsLoadingData(false);
    };

    const sendMessage = async (text) => {
        const messageText = (text || inputMessage).trim();
        if (!messageText || isLoading) return;

        setInputMessage("");
        const userMsg = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const systemContext = buildSystemContext(projects, documents);
            const conversationHistory = [...messages, userMsg]
                .map(m => `${m.role === 'user' ? 'Użytkownik' : 'Kengo'}: ${m.content}`)
                .join('\n\n');

            const response = await InvokeLLM({
                prompt: `${systemContext}\n\nHISTORIA ROZMOWY:\n${conversationHistory}\n\nOdpowiedz na ostatnią wiadomość użytkownika.`
            });
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            trackProductEvent('asystent_uzyty');
        } catch (error) {
            console.error("Error calling LLM:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Przepraszam, coś poszło nie tak. Spróbuj ponownie za chwilę.'
            }]);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "var(--k-bg)" }}>
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--k-accent)" }} />
                    <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>Ładuję Twoje dane...</p>
                </div>
            </div>
        );
    }

    const subtitle = projects.length > 0
        ? `${projects.length} ${projects.length === 1 ? 'projekt' : 'projekty'} · ${documents.length} dokumentów`
        : 'Zacznij rozmowę — pomogę Ci zorganizować remont';

    return (
        /*
         * LAYOUT PATTERN dla chat UI:
         * 1. flex-1 min-h-0 — wypełnia dostępną wysokość (nie więcej)
         * 2. flex flex-col — układ pionowy
         * 3. min-h-0 na każdym flex child — pozwala na kurczenie poniżej content size
         * 4. overflow-y-auto tylko na messages — reszta jest flex-shrink-0
         */
        <div
            className="flex-1 flex flex-col min-h-0"
            style={{ backgroundColor: "var(--k-bg)" }}
        >
            {/* Wrapper z max-width i paddingiem */}
            <div className="flex flex-col flex-1 min-h-0 w-full max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-10 pb-2 md:pb-10">

                {/* Header — kompaktowy na mobile */}
                <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                    <div className="icon-box w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <KengoIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h1 className="text-base md:text-3xl font-semibold tracking-tight" style={{ color: "var(--k-text)" }}>
                            Asystent Kengo
                        </h1>
                        <p className="text-xs md:text-sm" style={{ color: "var(--k-text-subtle)" }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Karta czatu — wypełnia pozostałą przestrzeń */}
                <div className="apple-blur rounded-2xl apple-shadow flex flex-col flex-1 min-h-0">

                    {/* Wiadomości — jedyny element który scrolluje */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                <div className="icon-box w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-4">
                                    <KengoIcon className="w-6 h-6 md:w-7 md:h-7" />
                                </div>
                                <h3 className="text-base font-medium mb-2" style={{ color: "var(--k-text)" }}>
                                    Cześć! Jak mogę pomóc?
                                </h3>
                                <p className="text-sm max-w-xs" style={{ color: "var(--k-text-subtle)" }}>
                                    Pytaj o projekty, budżet, gwarancje — znam Twoje dane i odpowiem konkretnie.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
                        )}

                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="icon-box w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                    <KengoIcon className="w-4 h-4" />
                                </div>
                                <div className="apple-shadow rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }}>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--k-text-subtle)", animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--k-text-subtle)", animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--k-text-subtle)", animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chipsy — poziomy scroll, nie scrolluje strona */}
                    <div
                        className="flex-shrink-0 overflow-x-auto scrollbar-hide px-3 pt-2"
                        style={{ borderTop: "1px solid var(--k-border)" }}
                    >
                        <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => sendMessage(action.prompt)}
                                    disabled={isLoading}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                                    style={{
                                        border: "1px solid var(--k-border-md)",
                                        color: "var(--k-text-muted)",
                                        backgroundColor: "var(--k-bg)"
                                    }}
                                >
                                    <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "var(--k-accent)" }} />
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input — zawsze na dole karty */}
                    <div className="flex-shrink-0 p-3 md:p-4">
                        <div className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Zadaj pytanie..."
                                className="flex-1 rounded-xl"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !inputMessage.trim()}
                                className="btn-primary rounded-xl px-3 flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                className="text-xs mt-2 ml-1"
                                style={{ color: "var(--k-text-subtle)" }}
                            >
                                Wyczyść rozmowę
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
