"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Lead = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  language: string;
  createdAt: string;
  conversations: { id: string; channel: string }[];
};

export function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, body: message }),
    });
    setMessage("");
  };

  const handleStartCall = async () => {
    await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calling Agent</h1>
            <p className="text-zinc-500">AI-powered lead communication dashboard</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Leads</CardDescription>
              <CardTitle className="text-3xl">{leads.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>New Today</CardDescription>
              <CardTitle className="text-3xl">
                {leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>SMS Conversations</CardDescription>
              <CardTitle className="text-3xl">
                {leads.filter((l) => l.conversations.some((c) => c.channel === "sms")).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Chat Conversations</CardDescription>
              <CardTitle className="text-3xl">
                {leads.filter((l) => l.conversations.some((c) => c.channel === "chat")).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Leads captured from all connected channels.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>
                          {lead.email || lead.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{lead.status}</Badge>
                        </TableCell>
                        <TableCell>{lead.language}</TableCell>
                        <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {leads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-zinc-500">
                          No leads yet. Connect a lead source or use the chatbot embed.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Send an SMS or start an AI call to a lead.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSendSms} className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Phone number (+1234567890)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="sm:w-64"
                  />
                  <Input
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">Send SMS</Button>
                </form>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleStartCall}>
                    Start AI Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
