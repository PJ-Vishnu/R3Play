import {
  PanelLeft,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function Loading() {
  return (
    <SidebarProvider>
      <div className="bg-background min-h-svh">
        <Sidebar
          className="bg-sidebar-background"
          collapsible="icon"
          variant="sidebar"
        >
          <div className="p-2 space-y-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col h-full max-h-svh overflow-hidden">
            <header className="flex h-16 items-center justify-between border-b px-4 shrink-0">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <PanelLeft className="h-5 w-5"/>
                </Button>
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[120px]">
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
