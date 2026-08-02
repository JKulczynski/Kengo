import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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

function buildSystemContext(projects, documents, t) {
    const none = t("assistant.systemPrompt.none");
    const projectsSummary = projects.map(p => {
        const projectDocs = documents.filter(d => d.project_id === p.id);
        const spent = projectDocs.reduce((sum, d) => sum + (d.amount || 0), 0);
        return t("assistant.systemPrompt.projectLine", {
            name: p.name,
            status: p.status,
            budget: (p.budget || 0).toLocaleString('pl-PL'),
            spent: spent.toLocaleString('pl-PL'),
            type: p.type || none,
            description: p.description || none,
            deadline: p.target_completion || none,
        });
    }).join('\n');

    const documentsSummary = documents.slice(0, 60).map(d =>
        t("assistant.systemPrompt.documentLine", {
            title: d.title,
            type: d.type,
            vendor: d.vendor || none,
            amount: d.amount ? `${d.amount.toLocaleString('pl-PL')} zł` : none,
            date: d.date || none,
            warranty: d.warranty_end_date || none,
        })
    ).join('\n');

    return `${t("assistant.systemPrompt.intro")}

${t("assistant.systemPrompt.userData")}

${t("assistant.systemPrompt.projectsLabel", { count: projects.length })}
${projectsSummary || t("assistant.systemPrompt.noProjects")}

${t("assistant.systemPrompt.documentsLabel", { count: documents.length })}
${documentsSummary || t("assistant.systemPrompt.noDocuments")}

${t("assistant.systemPrompt.rulesTitle")}
- ${t("assistant.systemPrompt.rule1")}
- ${t("assistant.systemPrompt.rule2")}
- ${t("assistant.systemPrompt.rule3")}
- ${t("assistant.systemPrompt.rule4")}
- ${t("assistant.systemPrompt.rule5")}`;
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

export default function AssistantPage() {
    const { t } = useTranslation();

    const quickActions = [
        { label: t("assistant.quickActions.myProjects.label"), prompt: t("assistant.quickActions.myProjects.prompt") },
        { label: t("assistant.quickActions.expenseAnalysis.label"), prompt: t("assistant.quickActions.expenseAnalysis.prompt") },
        { label: t("assistant.quickActions.warranties.label"), prompt: t("assistant.quickActions.warranties.prompt") },
        { label: t("assistant.quickActions.whatsNext.label"), prompt: t("assistant.quickActions.whatsNext.prompt") },
        { label: t("assistant.quickActions.howMuchSpent.label"), prompt: t("assistant.quickActions.howMuchSpent.prompt") },
    ];

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
            const systemContext = buildSystemContext(projects, documents, t);
            const conversationHistory = [...messages, userMsg]
                .map(m => `${m.role === 'user' ? t("assistant.systemPrompt.userRole") : t("assistant.systemPrompt.assistantRole")}: ${m.content}`)
                .join('\n\n');

            const response = await InvokeLLM({
                prompt: `${systemContext}\n\n${t("assistant.systemPrompt.historyLabel")}\n${conversationHistory}\n\n${t("assistant.systemPrompt.finalInstruction")}`
            });
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            trackProductEvent('asystent_uzyty');
        } catch (error) {
            console.error("Error calling LLM:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: t("assistant.errorMessage")
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
                    <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>{t("assistant.loadingData")}</p>
                </div>
            </div>
        );
    }

    const subtitle = projects.length > 0
        ? (projects.length === 1
            ? t("assistant.subtitleWithProjectsOne", { count: projects.length, docs: documents.length })
            : t("assistant.subtitleWithProjectsOther", { count: projects.length, docs: documents.length }))
        : t("assistant.subtitleEmpty");

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
                            {t("assistant.title")}
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
                                    {t("assistant.welcomeTitle")}
                                </h3>
                                <p className="text-sm max-w-xs" style={{ color: "var(--k-text-subtle)" }}>
                                    {t("assistant.welcomeDesc")}
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
                                placeholder={t("assistant.inputPlaceholder")}
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
                                {t("assistant.clearConversation")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
