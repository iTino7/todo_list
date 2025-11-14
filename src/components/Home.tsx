import * as React from "react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { Home as HomeIcon, ListTodo, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

function MenuButtonWithExpand({
  tooltip,
  children,
  className,
  isActive = false,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton> & {
  isActive?: boolean;
}) {
  const { state, setOpen } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === "collapsed") {
      setOpen(true);
    }
    props.onClick?.(e);
  };

  return (
    <SidebarMenuButton 
      tooltip={tooltip} 
      onClick={handleClick}
      isActive={isActive}
      className={cn(
        "border-0! hover:border-0! active:border-0! focus-visible:border-0! ring-0! hover:ring-0! active:ring-0! focus-visible:ring-0! outline-none! shadow-none!",
        "py-5! px-3! bg-transparent! hover:bg-zinc-200 active:bg-zinc-200 focus-visible:bg-transparent!",
        isActive && "bg-zinc-200! hover:bg-zinc-200!",
        className
      )}
      {...props}
    >
      {children}
    </SidebarMenuButton>
  );
}

function Home() {
  const [activeItem, setActiveItem] = useState<"home" | "settings">("home");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <ListTodo className="size-6" />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
              Todo List
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="group-data-[collapsible=icon]:items-center mt-4">
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <MenuButtonWithExpand 
                tooltip="Home" 
                isActive={activeItem === "home"}
                onClick={() => setActiveItem("home")}
              >
                <HomeIcon />
                <span>Home</span>
              </MenuButtonWithExpand>
            </SidebarMenuItem>
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <MenuButtonWithExpand 
                tooltip="Impostazioni" 
                isActive={activeItem === "settings"}
                onClick={() => setActiveItem("settings")}
              >
                <Settings />
                <span>Impostazioni</span>
              </MenuButtonWithExpand>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Versione 1.0.0
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! border-0! hover:border-0! active:border-0! focus-visible:border-0! ring-0! hover:ring-0! active:ring-0! focus-visible:ring-0! outline-none!">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="max-w-4xl w-full text-center">
              <h1 className="text-4xl font-bold mb-8">
                Benvenuto nella Todo List
              </h1>
              <p className="text-muted-foreground text-lg">
                Inizia a organizzare le tue attività
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Home;

