import React from "react";
import { 
  useListAccounts, 
  getListAccountsQueryKey,
  useCreateAccount,
  useDeleteAccount,
  CreateAccountBody
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Mail, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const accountSchema = z.object({
  label: z.string().min(1, "Název je povinný"),
  email: z.string().email("Neplatný e-mail"),
  password: z.string().min(1, "Heslo je povinné"),
  imapHost: z.string().min(1, "IMAP host je povinný"),
  imapPort: z.coerce.number().int().min(1).default(993),
});

export default function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: accounts, isLoading } = useListAccounts({ query: { queryKey: getListAccountsQueryKey() } });
  
  const createAccount = useCreateAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        toast({ title: "Účet přidán", description: "E-mailový účet byl úspěšně přidán." });
        form.reset();
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Chyba", description: err.message || "Nepodařilo se přidat účet." });
      }
    }
  });

  const deleteAccount = useDeleteAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        toast({ title: "Účet odstraněn" });
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Chyba", description: err.message || "Nepodařilo se odstranit účet." });
      }
    }
  });

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      label: "",
      email: "",
      password: "",
      imapHost: "imap.gmail.com",
      imapPort: 993,
    },
  });

  const onSubmit = (data: z.infer<typeof accountSchema>) => {
    createAccount.mutate({ data });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Nastavení účtů</h1>
          <p className="text-muted-foreground">Spravujte e-mailové schránky, které dashboard sleduje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Přidat účet</CardTitle>
                <CardDescription>Připojte novou IMAP schránku</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Název (např. Podpora)</FormLabel>
                          <FormControl>
                            <Input placeholder="Podpora" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mailová adresa</FormLabel>
                          <FormControl>
                            <Input placeholder="podpora@firma.cz" type="email" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heslo / App Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imapHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="imap.gmail.com" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imapPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMAP Port</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createAccount.isPending}>
                      {createAccount.isPending ? "Přidávám..." : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Přidat účet
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Sledované schránky</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-12 bg-background animate-pulse rounded-md" />
                    ))}
                  </div>
                ) : !accounts || accounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-md">
                    Žádné připojené účty.
                  </div>
                ) : (
                  <div className="border border-border rounded-md overflow-hidden bg-background/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-border">
                          <TableHead>Název</TableHead>
                          <TableHead>Spojení</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map(account => (
                          <TableRow key={account.id} className="border-border hover:bg-secondary/30">
                            <TableCell>
                              <div className="font-medium text-foreground">{account.label}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {account.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                                <Server className="w-3 h-3" /> {account.imapHost}:{account.imapPort}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteAccount.mutate({ id: account.id })}
                                disabled={deleteAccount.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}
