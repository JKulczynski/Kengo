import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Send,
    Sparkles,
    Bot,
    Loader2,
    User,
    Zap
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUser
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
                {isUser
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />
                }
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-900 text-black dark:text-white apple-shadow rounded-tl-sm'
            }`}>
                {message.content}
            </div>
        </div>
    );
}

const quickActions = [
    { label: "Moje projekty", prompt: "Podsumuj moje projekty — co jest aktywne, jaki jest budżet i co wymaga uwagi?" },
    { label: "Analiza wydatków", prompt: "Przeanalizuj moje wydatki i powiedz, gdzie idzie najwięcej pieniędzy." },
    { label: "Gwarancje", prompt: "Które gwarancje wygasają wkrótce? Daj mi przegląd." },
    { label: "Co zrobić dalej?", prompt: "Patrząc na moje projekty — co powinienem zrobić teraz, żeby posunąć prace do przodu?" },
];

export default function AssistantPage() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [projects, setProjects] = useState([]);
    const [documents, setDocuments] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadUserData();
    }, []);

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

            const fullPrompt = `${systemContext}

HISTORIA ROZMOWY:
${conversationHistory}

Odpowiedz na ostatnią wiadomość użytkownika.`;

            const response = await InvokeLLM({ prompt: fullPrompt });
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Ładuję Twoje dane...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                            Asystent Kengo
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                            {projects.length > 0
                                ? `Znam Twoje ${projects.length} ${projects.length === 1 ? 'projekt' : 'projekty'} i ${documents.length} dokumentów`
                                : 'Zacznij rozmowę — pomogę Ci zorganizować remont'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                {messages.length === 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => sendMessage(action.prompt)}
                                disabled={isLoading}
                                className="apple-blur rounded-xl p-4 text-left apple-shadow hover:apple-shadow-lg transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                                    <p className="font-medium text-black dark:text-white text-sm">{action.label}</p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                                    {action.prompt}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat */}
                <div className="apple-blur rounded-2xl apple-shadow flex flex-col" style={{ minHeight: '500px' }}>
                    {/* Messages area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                        {messages.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bot className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-base font-medium text-black dark:text-white mb-2">
                                    Cześć! Jak mogę pomóc?
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    Pytaj o projekty, budżet, gwarancje — znam Twoje dane i odpowiem konkretnie.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
                        )}

                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white dark:bg-gray-900 apple-shadow rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex gap-3">
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
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                className="text-xs text-gray-400 hover:text-gray-600 mt-2 ml-1"
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
