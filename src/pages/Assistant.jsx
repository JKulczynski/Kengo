
import React, { useState, useEffect, useCallback } from "react";
import { agentSDK } from "@/agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Send, 
    Sparkles, 
    MessageSquare, 
    Bot,
    Loader2,
    ExternalLink,
    MessageCircle,
    Zap
} from "lucide-react";
import MessageBubble from "../components/assistant/MessageBubble";

export default function AssistantPage() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    const createNewConversation = useCallback(async () => {
        try {
            const newConv = await agentSDK.createConversation({
                agent_name: "renovation_assistant",
                metadata: {
                    name: `Rozmowa ${new Date().toLocaleString("pl-PL")}`,
                    description: "Rozmowa z asystentem remontowym"
                }
            });
            setActiveConversation(newConv);
            setConversations(prev => [newConv, ...prev]);
            setMessages([]);
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    }, []);

    const loadConversations = useCallback(async () => {
        try {
            const convs = await agentSDK.listConversations({
                agent_name: "renovation_assistant",
            });
            setConversations(convs);
            
            // If there are existing conversations, load the most recent one
            if (convs.length > 0) {
                setActiveConversation(convs[0]);
            } else {
                // Create a new conversation if none exist
                await createNewConversation();
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
        setIsLoadingConversations(false);
    }, [createNewConversation]); // createNewConversation is stable due to useCallback([])

    useEffect(() => {
        loadConversations();
    }, [loadConversations]); // loadConversations is stable due to useCallback([])

    useEffect(() => {
        if (activeConversation) {
            const unsubscribe = agentSDK.subscribeToConversation(activeConversation.id, (data) => {
                setMessages(data.messages || []);
                setIsLoading(false);
            });

            return () => {
                unsubscribe();
            };
        }
    }, [activeConversation]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || !activeConversation || isLoading) return;

        const messageText = inputMessage.trim();
        setInputMessage("");
        setIsLoading(true);

        try {
            await agentSDK.addMessage(activeConversation, {
                role: "user",
                content: messageText
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const whatsappURL = agentSDK.getWhatsAppConnectURL('renovation_assistant');

    if (isLoadingConversations) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading assistant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-4xl font-semibold text-black dark:text-white tracking-tight">
                                AI Assistant
                            </h1>
                        </div>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                            Twój inteligentny asystent remontowy
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={createNewConversation}
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Nowa rozmowa
                        </Button>
                        <a href={whatsappURL} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-green-500 hover:bg-green-600 text-white">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="apple-blur apple-shadow border-0 hover:apple-shadow-lg transition-shadow cursor-pointer" 
                          onClick={() => setInputMessage("Pokaż mi wszystkie moje projekty")}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-black dark:text-white text-sm">Moje projekty</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pokaż wszystkie projekty</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="apple-blur apple-shadow border-0 hover:apple-shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setInputMessage("Jaki jest status mojego budżetu?")}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-black dark:text-white text-sm">Analiza budżetu</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Status wydatków</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="apple-blur apple-shadow border-0 hover:apple-shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setInputMessage("Pokaż mi gwarancje wygasające w najbliższym czasie")}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950 rounded-lg flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-black dark:text-white text-sm">Gwarancje</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Sprawdź daty ważności</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Interface */}
                <div className="apple-blur rounded-2xl apple-shadow-lg h-[600px] flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                                    Witaj w RenovateAI Assistant!
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    Jestem Twoim inteligentnym asystentem remontowym. Mogę pomóc Ci:
                                </p>
                                <div className="text-left max-w-md mx-auto text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p>• Zarządzać projektami i dokumentami</p>
                                    <p>• Analizować budżet i wydatki</p>
                                    <p>• Śledzić gwarancje</p>
                                    <p>• Udzielać porad remontowych</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <MessageBubble key={index} message={message} />
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Asystent pisze...</span>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex gap-3">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Zadaj pytanie lub poproś o pomoc..."
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button 
                                onClick={sendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
